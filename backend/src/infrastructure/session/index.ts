import env from '@/env.js';
import { RedisStore } from 'connect-redis';
import type { RequestHandler } from 'express';
import session from 'express-session';
import { createClient } from 'redis';

export const sessionRedis = createClient({
  url: env.REDIS_URL,
});

sessionRedis.on('error', (error) => {
  console.error('Session redis error:', error);
});

export async function connectSessionRedis() {
  if (sessionRedis.isOpen) return;

  sessionRedis.connect();
}

export const sessionMiddleware: RequestHandler = session({
  name: 'mailist.sid',
  store: new RedisStore({
    client: sessionRedis,
    prefix: 'mailist:sess:',
  }),
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
});
