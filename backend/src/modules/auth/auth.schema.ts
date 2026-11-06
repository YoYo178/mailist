import z from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
});
export type TRegisterData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});
export type TLoginData = z.infer<typeof loginSchema>;
