import http from 'node:http';

import app from '@/app.js';
import env from '@/env.js';
import { connectDB } from '@/infrastructure/database/mongodb.js';
import { redis } from '@/infrastructure/redis/connection.js';
import { connectSessionRedis } from './infrastructure/session/index.js';

const server = http.createServer(app);

async function bootstrap() {
  // Connect to MongoDB
  await connectDB();

  // Connect to Redis if not connected already
  if (redis.status === 'wait') await redis.connect();

  // Connect to session redis
  await connectSessionRedis();

  // Start listening on the server
  server.listen(env.PORT, async () => {
    console.log(`Listening on port ${env.PORT}`);
  });
}

try {
  await bootstrap();
} catch (error) {
  console.error('An error occured while starting the application:', error);
  throw error;
}
