import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])

    .default('development'),

  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  MONGODB_URI: z.string().min(1),

  REDIS_URL: z.url().default('redis://localhost:6379'),

  SESSION_SECRET: z.string().min(32),

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().min(1),

  GMAIL_TOKEN_ENCRYPTION_KEY: z.string().min(1),
});

export default envSchema.parse(process.env);
