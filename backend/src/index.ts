import http from 'node:http';

import app from '@/app.js';
import env from '@/env.js';

const server = http.createServer(app);

server.listen(env.PORT, () => {
    console.log(`Listening on port ${env.PORT}`)
})