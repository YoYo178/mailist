import type { DefaultJobOptions } from 'bullmq';

export const DEFAULT_JOB_OPTIONS: DefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
  removeOnComplete: 1000,
  removeOnFail: {
    age: 7 * 24 * 60 * 60,
  },
};
