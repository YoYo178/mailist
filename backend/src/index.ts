import http from 'node:http';

import app from '@/app.js';
import env from '@/env.js';
import { connectDB } from '@/infrastructure/database/mongodb.js';

const server = http.createServer(app);

server.listen(env.PORT, async () => {
  console.log(`Listening on port ${env.PORT}`);

  await connectDB();
});
