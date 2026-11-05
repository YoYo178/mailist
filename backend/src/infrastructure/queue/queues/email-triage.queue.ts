import { Queue } from 'bullmq';

import { redis } from '@/infrastructure/redis/connection.js';
import type { EmailTriageJobData, EmailTriageJobResult } from '@/modules/triage/triage.types.js';

export const emailTriageQueue = new Queue<EmailTriageJobData, EmailTriageJobResult>(
  'email-triage',
  {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: 1000,
      removeOnFail: {
        age: 7 * 24 * 60 * 60,
      },
    },
  },
);
