import { triageService } from '@/dependencies/services.js';
import env from '@/env.js';
import type { EmailTriageJobData, EmailTriageJobResult } from '@/modules/triage/triage.types.js';
import { Worker } from 'bullmq';
import { Redis } from 'ioredis';

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const emailTriageWorker = new Worker<EmailTriageJobData, EmailTriageJobResult>(
  'email-triage',
  async (job) => {
    console.log(`Processing triage job ${job.id}`);

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
  console.log(`Triage job ${job.id} completed`, result);
});

emailTriageWorker.on('failed', (job, error) => {
  console.error(`Triage job ${job?.id} failed:`, error);
});

emailTriageWorker.on('error', (error) => {
  console.error('Triage worker error:', error);
});
