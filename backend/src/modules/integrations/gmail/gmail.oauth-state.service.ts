import { redis } from '@/infrastructure/redis/connection.js';
import { randomBytes } from 'crypto';
import type { IOauthState } from './gmail.types.js';

export class GmailOauthStateService {
  private createKey(state: string) {
    return `oauth:gmail:${state}`;
  }

  async create(userId: string, sessionId: string): Promise<string> {
    const state = randomBytes(32).toString('hex');

    const value: IOauthState = { userId, sessionId };

    await redis.set(this.createKey(state), JSON.stringify(value), 'EX', 600);

    return state;
  }

  async consume(state: string): Promise<IOauthState | null> {
    const key = this.createKey(state);
    const value = await redis.getdel(key);

    return value ? (JSON.parse(value) as IOauthState) : null;
  }
}
