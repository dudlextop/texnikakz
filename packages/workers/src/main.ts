import { QueueEvents, Worker } from 'bullmq';
import Redis from 'ioredis';
import pino from 'pino';

const logger = pino({ name: 'workers', level: process.env.LOG_LEVEL ?? 'debug' });

const connection = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');

const queues = ['listing-index', 'promotion', 'autobump'];

queues.forEach((queueName) => {
  const worker = new Worker(
    queueName,
    async (job) => {
      logger.info({ queue: queueName, jobId: job.id, name: job.name }, 'Processing job');
      // TODO: implement domain logic in later phases
    },
    { connection }
  );

  const events = new QueueEvents(queueName, { connection });

  events.on('failed', ({ jobId, failedReason }) => {
    logger.error({ queue: queueName, jobId, failedReason }, 'Job failed');
  });

  events.on('completed', ({ jobId }) => {
    logger.info({ queue: queueName, jobId }, 'Job completed');
  });

  worker.on('error', (error) => logger.error({ queue: queueName, error }, 'Worker error'));
});

logger.info({ queues }, 'Workers bootstrapped');
