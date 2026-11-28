import env from '@/env.js';
import { GeminiClient } from '@/infrastructure/ai/gemini.client.js';
import { GmailClient } from '@/modules/integrations/gmail/gmail.client.js';

export const gmailClient = new GmailClient();

export const geminiClient = new GeminiClient(env.GEMINI_API_KEY);
