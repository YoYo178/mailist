import type { ZodType } from 'zod';

export interface ILLMGenerationRequest<T> {
  model: string;
  systemInstruction: string;
  prompt: string;
  responseSchema: ZodType<T>;
}

export interface ILLMProvider {
  generate<T>(request: ILLMGenerationRequest<T>): Promise<T>;
  getModels(): readonly string[];
}
