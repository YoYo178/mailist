import { gmailService } from '@/dependencies/services.js';
import env from '@/env.js';
import type {
  GmailSyncJobData,
  GmailSyncJobResult,
} from '@/modules/integrations/gmail/gmail.types.js';
import { Worker } from 'bullmq';
import { Redis } from 'ioredis';

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const emailSyncWorker = new Worker<GmailSyncJobData, GmailSyncJobResult>(
  'email-sync',
  async (job) => {
    console.log(`Processing job ${job.id}`);

    const { userId } = job.data;

    await gmailService.syncMessages(userId);

    return {
      success: true,
      userId,
    };
  },
  {
    connection,
    concurrency: 1,
  },
);

emailSyncWorker.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed`, result);
});

emailSyncWorker.on('failed', (job, error) => {
  console.log(`Job ${job?.id} failed`, error);
});

emailSyncWorker.on('error', (error) => {
  console.log('Worker error:', error);
});
