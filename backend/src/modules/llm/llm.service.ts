import { HttpStatus } from '@/lib/http.lib.js';
import type { LLMRepository } from './llm.repository.js';
import type { ILLMGenerationRequest, ILLMProvider, TLLMFailureIncident } from './llm.types.js';

const PROMPT_TIMEOUT = 60 * 1000; // 1 minute
const RATE_LIMIT_COOLDOWN = 2 * 24 * 60 * 60 * 1000; // 2 days (48 hours)

class LLMTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LLMTimeoutError';
  }
}

function getStatusCode(error: unknown): number | null {
  if (!error || typeof error !== 'object') return null;

  const status =
    'status' in error ? error.status : 'statusCode' in error ? error.statusCode : undefined;

  return typeof status === 'number' ? status : null;
}

function isRetryableError(error: unknown): boolean {
  const status = getStatusCode(error);

  return (
    error instanceof LLMTimeoutError ||
    (status !== null && [408, 429, 500, 502, 503, 504].includes(status))
  );
}

function getIncidentType(error: unknown): TLLMFailureIncident {
  const status = getStatusCode(error);

  if (error instanceof LLMTimeoutError) {
    return { incidentType: 'timeout' };
  }

  if (status === HttpStatus.TOO_MANY_REQUESTS) {
    return {
      incidentType: 'rate-limit',
      rateLimitedAt: new Date(),
    };
  }

  if (status === HttpStatus.REQUEST_TIMEOUT || status === HttpStatus.GATEWAY_TIMEOUT) {
    return { incidentType: 'timeout' };
  }

  return { incidentType: 'generic' };
}

export class LLMService {
  constructor(
    private provider: ILLMProvider,
    private llmRepository: LLMRepository,
  ) { }

  private getAvailableModels(
    models: readonly string[],
    incidents: Awaited<ReturnType<LLMRepository['findAll']>>,
  ): string[] {
    const incidentMap = new Map(incidents.map((incident) => [incident.modelName, incident]));

    const now = Date.now();

    return models.filter((model) => {
      const incident = incidentMap.get(model);

      if (!incident?.rateLimitedAt) return true;

      const expiry = incident.rateLimitedAt.getTime() + RATE_LIMIT_COOLDOWN;

      return now >= expiry;
    });
  }

  private rankModels(
    models: string[],
    incidents: Awaited<ReturnType<LLMRepository['findAll']>>,
  ): string[] {
    const incidentMap = new Map(incidents.map((incident) => [incident.modelName, incident]));

    return [...models].sort((a, b) => {
      const aIncident = incidentMap.get(a);
      const bIncident = incidentMap.get(b);

      const aTotal = aIncident?.totalRequests ?? 0;
      const bTotal = bIncident?.totalRequests ?? 0;

      const aSuccessful = aIncident?.successfulRequests ?? 0;
      const bSuccessful = bIncident?.successfulRequests ?? 0;

      const aReliability = (aSuccessful + 1) / (aTotal + 2);
      const bReliability = (bSuccessful + 1) / (bTotal + 2);

      // Maximize reliability (b - a)
      if (aReliability !== bReliability) {
        return bReliability - aReliability;
      }

      const aAverageResponseTime =
        aSuccessful > 0 ? (aIncident?.totalResponseTimeMs ?? 0) / aSuccessful : Infinity;

      const bAverageResponseTime =
        bSuccessful > 0 ? (bIncident?.totalResponseTimeMs ?? 0) / bSuccessful : Infinity;

      // Minimize response time (a - b)
      return aAverageResponseTime - bAverageResponseTime;
    });
  }

  private async generateWithTimeout<T>(
    request: Omit<ILLMGenerationRequest<T>, 'model'>,
    model: string,
  ): Promise<T> {
    const controller = new AbortController();

    let timeout: ReturnType<typeof setTimeout> | undefined;

    const generationPromise = this.provider.generate({
      ...request,
      model,
      signal: controller.signal,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => {
        const error = new LLMTimeoutError(`Model ${model} timed out after ${PROMPT_TIMEOUT}ms`);

        controller.abort(error);
        reject(error);
      }, PROMPT_TIMEOUT);
    });

    try {
      return await Promise.race([generationPromise, timeoutPromise]);
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  private async recordSuccess(model: string, responseTimeMs: number): Promise<void> {
    try {
      await this.llmRepository.recordSuccess(model, responseTimeMs);
    } catch (error) {
      console.error(`[LLM] Failed to record successful request for ${model}:`, error);
    }
  }

  private async reportIncident(model: string, incident: TLLMFailureIncident): Promise<void> {
    try {
      await this.llmRepository.saveIncident(model, incident);
    } catch (error) {
      console.error(`[LLM] Failed to persist incident for ${model}:`, error);
    }
  }

  async generate<T>(request: Omit<ILLMGenerationRequest<T>, 'model'>): Promise<T> {
    const models = this.provider.getModels();

    if (!models.length) {
      throw new Error('Models not configured for the given LLM Provider!');
    }

    const incidents = await this.llmRepository.findAll();

    const availableModels = this.getAvailableModels(models, incidents);

    if (!availableModels.length) {
      throw new Error('All configured LLM models are currently rate-limited.');
    }

    const sortedModels = this.rankModels(availableModels, incidents);

    console.info('[LLM] Model priority:', sortedModels);

    let lastError: unknown;

    for (const model of sortedModels) {
      const startedAt = Date.now();

      try {
        console.info(`[LLM] Trying model: ${model}`);

        const result = await this.generateWithTimeout(request, model);

        const responseTimeMs = Date.now() - startedAt;

        await this.recordSuccess(model, responseTimeMs);

        console.info(`[LLM] Model ${model} succeeded in ${responseTimeMs}ms`);

        return result;
      } catch (error) {
        lastError = error;

        const incident = getIncidentType(error);

        await this.reportIncident(model, incident);

        if (!isRetryableError(error)) {
          throw error;
        }

        console.warn(
          `[LLM] Model ${model} failed (${incident.incidentType}). Trying next model...`,
        );
      }
    }

    throw lastError;
  }
}
