import { z } from 'zod';

export const callbackSuccessSchema = z.object({
  state: z.string().min(1),
  scope: z.string().min(1),
  code: z.string().min(1),
  authuser: z.coerce.number(),
  prompt: z.enum(['consent']),
  iss: z.string().optional(),
  error: z.string().optional(),
});
export type TCallbackSuccessData = z.infer<typeof callbackSuccessSchema>;
