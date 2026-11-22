import z from 'zod';
import { TRIAGE_CATEGORIES, TRIAGE_PRIORITIES } from './triage.types.js';

export const triageOutputSchema = z.object({
  category: z.enum(TRIAGE_CATEGORIES),

  priority: z.enum(TRIAGE_PRIORITIES),

  summary: z.string().min(1),

  actionItems: z.array(
    z.object({
      description: z.string().min(1),
      deadline: z.iso.datetime().nullable(),
    }),
  ),

  suggestedReply: z.string().nullable(),
});

export type TTriageOutput = z.infer<typeof triageOutputSchema>;
