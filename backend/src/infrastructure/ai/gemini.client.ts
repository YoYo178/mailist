import type { ILLMGenerationRequest, ILLMProvider } from '@/modules/llm/llm.types.js';
import { GoogleGenAI } from '@google/genai';
import z from 'zod';

export class GeminiClient implements ILLMProvider {
  private client: GoogleGenAI;
  private readonly models: string[] = [
    'gemini-3.8-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemma-4-31b-it',
    'gemma-4-26b-a4b-it',
  ] as const;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({
      apiKey,
    });
  }

  async generate<T>(request: ILLMGenerationRequest<T>): Promise<T> {
    const response = await this.client.models.generateContent({
      model: request.model,
      contents: request.prompt,
      config: {
        systemInstruction: request.systemInstruction,
        responseMimeType: 'application/json',
        responseJsonSchema: z.toJSONSchema(request.responseSchema),
      },
    });

    const text = response.text;

    if (!text) throw new Error('Received an empty response from Gemini');

    const parsed = JSON.parse(text);

    return request.responseSchema.parse(parsed);
  }

  getModels() {
    return this.models;
  }
}
