import { Queue } from 'bullmq';

import { redis } from '@/infrastructure/redis/connection.js';
import type {
  GmailSyncJobData,
  GmailSyncJobResult,
} from '@/modules/integrations/gmail/gmail.types.js';
import { DEFAULT_JOB_OPTIONS } from '../queue.config.js';

export const emailSyncQueue = new Queue<GmailSyncJobData, GmailSyncJobResult>('email-sync', {
  connection: redis,
  defaultJobOptions: {
    ...DEFAULT_JOB_OPTIONS,
  },
});
