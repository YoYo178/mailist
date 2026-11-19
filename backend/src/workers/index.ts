import { connectDB } from '@/infrastructure/database/mongodb.js';

async function bootstrap() {
  // Connect to MongoDB before starting workers
  await connectDB();

  // Initialize workers only after MongoDB is connected
  const { emailTriageWorker } = await import('./email-triage.worker.js');
  const { emailSyncWorker } = await import('./email-sync.worker.js');

  console.log('Mailist workers started!');

  let shuttingDown = false;

  async function shutdown() {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log('Shutting down workers...');

    await Promise.all([emailTriageWorker.close(), emailSyncWorker.close()]);

    console.log('Workers stopped');
    process.exit(0);
  }

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

try {
  await bootstrap();
} catch (error) {
  console.error('An error occurred while starting workers:', error);
  process.exit(1);
}
