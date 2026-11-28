import type { ZodType } from 'zod';

export interface ILLMGenerationRequest<T> {
  model: string;
  systemInstruction: string;
  prompt: string;
  responseSchema: ZodType<T>;
  signal?: AbortSignal;
}

export interface ILLMProvider {
  generate<T>(request: ILLMGenerationRequest<T>): Promise<T>;
  getModels(): readonly string[];
}

export type TFailureIncident = 'timeout' | 'rate-limit' | 'generic';

export interface ILLMRateLimitFailureIncident {
  incidentType: 'rate-limit';
  rateLimitedAt: Date;
}

export interface ILLMGenericFailureIncident {
  incidentType: Exclude<TFailureIncident, 'rate-limit'>;
}

export type TLLMFailureIncident = ILLMRateLimitFailureIncident | ILLMGenericFailureIncident;
