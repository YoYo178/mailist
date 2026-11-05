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
    console.log(`Processing job ${job.id}`);

    const { emailId, userId } = job.data;

    // TODOs:
    // - Fetch email from MongoDB
    // - Run AI Triage
    // - Store Triage result

    console.log({ emailId, userId });

    return {
      success: true,
      emailId,
    };
  },
  {
    connection,
    concurrency: 5,
  },
);

emailTriageWorker.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed`, result);
});

emailTriageWorker.on('failed', (job, error) => {
  console.log(`Job ${job?.id} failed`, error);
});

emailTriageWorker.on('error', (error) => {
  console.log('Worker error:', error);
});
