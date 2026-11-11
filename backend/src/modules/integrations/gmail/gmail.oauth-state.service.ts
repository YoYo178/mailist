import { redis } from '@/infrastructure/redis/connection.js';
import { randomBytes } from 'crypto';

export class GmailOauthStateService {
  private createKey(state: string) {
    return `oauth:gmail:${state}`;
  }

  async create(userId: string): Promise<string> {
    const state = randomBytes(32).toString('hex');

    await redis.set(this.createKey(state), userId, 'EX', 600);

    return state;
  }

  async consume(state: string): Promise<string | null> {
    const key = this.createKey(state);

    return redis.getdel(key);
  }
}
