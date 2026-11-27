import { gmailService } from '@/dependencies/services.js';
import env from '@/env.js';
import { createLogger } from '@/lib/util.lib.js';
import type {
  GmailSyncJobData,
  GmailSyncJobResult,
} from '@/modules/integrations/gmail/gmail.types.js';
import { Worker } from 'bullmq';
import { Redis } from 'ioredis';

const log = createLogger('Worker', 'Sync');

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const emailSyncWorker = new Worker<GmailSyncJobData, GmailSyncJobResult>(
  'email-sync',
  async (job) => {
    log('info', `<== Job ${job.id} start`);

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
  log('info', `==> Job ${job.id} completed`, result);
});

emailSyncWorker.on('failed', (job, error) => {
  log('error', `==> Job ${job?.id} failed`, error);
});

emailSyncWorker.on('error', (error) => {
  log('error', `==> Worker error`, error);
});
