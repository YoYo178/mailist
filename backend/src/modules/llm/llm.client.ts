import type { ILLMGenerationRequest, ILLMProvider } from './llm.types.js';

function getStatusCode(error: unknown): number | null {
  if (!error || typeof error !== 'object') return null;

  const status =
    'status' in error ? error.status : 'statusCode' in error ? error.statusCode : undefined;

  return typeof status === 'number' ? status : null;
}

function isRetryableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const status = getStatusCode(error);
  if (!status) return false;

  return [408, 429, 500, 502, 503, 504].includes(status);
}

export class LLMClient {
  constructor(private provider: ILLMProvider) {}

  async generate<T>(request: Omit<ILLMGenerationRequest<T>, 'model'>): Promise<T> {
    const models = this.provider.getModels();

    if (!models.length) throw new Error('Models not configured for the given LLM Provider!');

    let lastError: unknown;

    for (const model of models) {
      try {
        console.info(`[LLM] Trying model: ${model}`);
        return await this.provider.generate({
          ...request,
          model,
        });
      } catch (error) {
        lastError = error;

        if (!isRetryableError(error)) throw error;

        const status = getStatusCode(error);
        console.warn(
          `[LLM] Model ${model} failed with status code ${status ?? 'unknown'}. Trying next model...`,
        );
      }
    }

    throw lastError;
  }
}
