import type { IBaseMongoDocumentWithTimestamp } from '@/types/mongodb.types.js';
import type mongoose from 'mongoose';

export interface EmailTriageJobData {
  emailId: string;
  userId: string;
}

export interface EmailTriageJobResult {
  success: boolean;
  emailId: string;
}

export const TRIAGE_STATUSES = ['pending', 'processing', 'completed', 'failed'] as const;
export type TTriageStatus = (typeof TRIAGE_STATUSES)[number];

export const TRIAGE_PRIORITIES = ['urgent', 'high', 'normal', 'low'] as const;
export type TTriagePriority = (typeof TRIAGE_PRIORITIES)[number];

export const TRIAGE_CATEGORIES = [
  'work',
  'personal',
  'finance',
  'shopping',
  'travel',
  'social',
  'promotional',
  'notification',
  'other',
] as const;
export type TTriageCategory = (typeof TRIAGE_CATEGORIES)[number];

export interface ITriageActionItem {
  description: string;
  deadline: Date | null;
}

export interface ITriage extends IBaseMongoDocumentWithTimestamp {
  emailId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;

  status: TTriageStatus;

  category: TTriageCategory | null;
  priority: TTriagePriority | null;

  summary: string | null;
  actionItems: ITriageActionItem[];

  suggestedReply: string | null;

  processedAt: Date | null;
  error: string | null;
}
