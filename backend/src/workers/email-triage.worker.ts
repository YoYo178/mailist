import { triageService } from '@/dependencies/services.js';
import env from '@/env.js';
import { createLogger } from '@/lib/util.lib.js';
import type { EmailTriageJobData, EmailTriageJobResult } from '@/modules/triage/triage.types.js';
import { Worker } from 'bullmq';
import { Redis } from 'ioredis';

const log = createLogger('Worker', 'Triage');

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const emailTriageWorker = new Worker<EmailTriageJobData, EmailTriageJobResult>(
  'email-triage',
  async (job) => {
    log('info', `<== Job ${job.id} start`)

    const { emailId, userId } = job.data;

    await triageService.processEmail(emailId, userId);

    return {
      success: true,
      emailId,
    };
  },
  {
    connection,
    concurrency: 1,
  },
);

emailTriageWorker.on('completed', (job, result) => {
  log('info', `==> Job ${job.id} completed`, result)
});

emailTriageWorker.on('failed', (job, error) => {
  log('error', `==> Job ${job?.id} failed`, error)
});

emailTriageWorker.on('error', (error) => {
  log('error', `==> Worker error`, error)
});
