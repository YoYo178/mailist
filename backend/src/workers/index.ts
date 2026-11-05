import { emailTriageWorker } from './email-triage.worker.js';

console.log('Mailist workers started!');

let shuttingDown = false;

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log('Shutting down workers...');

  await emailTriageWorker.close();

  console.log('Workers stopped');
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
