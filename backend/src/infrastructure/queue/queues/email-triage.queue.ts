import { Queue } from 'bullmq';

import { redis } from '@/infrastructure/redis/connection.js';
import type { EmailTriageJobData, EmailTriageJobResult } from '@/modules/triage/triage.types.js';
import { DEFAULT_JOB_OPTIONS } from '../queue.config.js';

export const emailTriageQueue = new Queue<EmailTriageJobData, EmailTriageJobResult>(
  'email-triage',
  {
    connection: redis,
    defaultJobOptions: {
      ...DEFAULT_JOB_OPTIONS,
    },
  },
);
