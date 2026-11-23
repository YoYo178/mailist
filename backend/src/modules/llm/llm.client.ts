import type { ILLMGenerationRequest, ILLMProvider } from './llm.types.js';

export class LLMClient {
  constructor(private provider: ILLMProvider) {}

  async generate<T>(request: Omit<ILLMGenerationRequest<T>, 'model'>): Promise<T> {
    const [model] = this.provider.getModels();

    if (!model) throw new Error('Models not configured for the given LLM Provider!');

    return this.provider.generate({
      ...request,
      model,
    });
  }
}
