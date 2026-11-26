import z from 'zod';
import { TRIAGE_CATEGORIES, TRIAGE_PRIORITIES } from '../triage/triage.types.js';

export const emailListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().positive().max(100).default(20),

  priority: z.enum(TRIAGE_PRIORITIES).optional(),

  category: z.enum(TRIAGE_CATEGORIES).optional(),
});

export type TEmailListQuery = z.infer<typeof emailListQuerySchema>;
