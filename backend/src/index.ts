import http from 'node:http';

import app from '@/app.js';
import env from '@/env.js';
import { connectDB } from '@/infrastructure/database/mongodb.js';
import { redis } from '@/infrastructure/redis/connection.js';

const server = http.createServer(app);

server.listen(env.PORT, async () => {
  console.log(`Listening on port ${env.PORT}`);

  await connectDB();

  if (redis.status === 'wait') await redis.connect();
});
