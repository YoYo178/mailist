import { GoogleGenAI } from '@google/genai';

export class GeminiClient {
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({
      apiKey,
    });
  }
}
