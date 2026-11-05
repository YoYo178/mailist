import env from '@/env.js';
import { Redis } from 'ioredis';

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
});

redis.on('connect', () => {
  console.error('[Redis] Connected!');
});

redis.on('error', (error) => {
  console.error('[Redis] Connection error: ', error);
});
