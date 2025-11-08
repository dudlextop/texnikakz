import {
  Queue,
  QueueEvents,
  QueueScheduler,
  Worker
} from 'bullmq';
import {
  Prisma,
  PrismaClient,
  PricingPlanCode,
  PromotionActivationStatus,
  PromotionSubjectType
} from '@prisma/client';
import Redis from 'ioredis';
import pino from 'pino';

const logger = pino({ name: 'workers', level: process.env.LOG_LEVEL ?? 'debug' });
const connection = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
const prisma = new PrismaClient();

const PLAN_CODE_BOOST: Record<PricingPlanCode, number> = {
  VIP: 2,
  TOP: 1.5,
  HIGHLIGHT: 0.3
};

const listingIndexQueueName = 'listing-index';
const promotionQueueName = 'promotion-lifecycle';

const listingIndexQueue = new Queue(listingIndexQueueName, { connection });
const promotionQueue = new Queue(promotionQueueName, { connection });
const promotionScheduler = new QueueScheduler(promotionQueueName, { connection });
const queueEventsRegistry: QueueEvents[] = [];

function registerQueueEvents(queueName: string) {
  const events = new QueueEvents(queueName, { connection });
  queueEventsRegistry.push(events);

  events.on('failed', ({ jobId, failedReason }) => {
    logger.error({ queue: queueName, jobId, failedReason }, 'Job failed');
  });

  events.on('completed', ({ jobId }) => {
    logger.info({ queue: queueName, jobId }, 'Job completed');
  });

  events.on('error', (error) => {
    logger.error({ queue: queueName, error }, 'Queue events error');
  });
}

registerQueueEvents(listingIndexQueueName);
registerQueueEvents('promotion');
registerQueueEvents('autobump');
registerQueueEvents(promotionQueueName);

async function computeListingBoost(tx: Prisma.TransactionClient, listingId: string, now: Date): Promise<number> {
  const activations = await tx.promotionActivation.findMany({
    where: {
      subjectType: PromotionSubjectType.LISTING,
      subjectId: listingId,
      status: PromotionActivationStatus.ACTIVE,
      expiresAt: {
        gt: now
      }
    }
  });

  return activations.reduce((max, activation) => {
    return Math.max(max, PLAN_CODE_BOOST[activation.planCode]);
  }, 0);
}

async function expirePromotions(now: Date) {
  return prisma.$transaction(async (tx) => {
    const expiring = await tx.promotionActivation.findMany({
      where: {
        status: PromotionActivationStatus.ACTIVE,
        expiresAt: {
          lte: now
        }
      }
    });

    if (!expiring.length) {
      return { listings: [] as string[], specialists: [] as string[] };
    }

    await tx.promotionActivation.updateMany({
      where: { id: { in: expiring.map((activation) => activation.id) } },
      data: { status: PromotionActivationStatus.EXPIRED }
    });

    const listingIds = new Set<string>();
    const specialistIds = new Set<string>();

    for (const activation of expiring) {
      if (activation.subjectType === PromotionSubjectType.LISTING) {
        listingIds.add(activation.subjectId);
      } else if (activation.subjectType === PromotionSubjectType.SPECIALIST) {
        specialistIds.add(activation.subjectId);
      }
    }

    for (const listingId of listingIds) {
      const boost = await computeListingBoost(tx, listingId, now);
      await tx.listing.update({ where: { id: listingId }, data: { boostScore: boost } });
    }

    return { listings: Array.from(listingIds), specialists: Array.from(specialistIds) };
  });
}

const promotionWorker = new Worker(
  promotionQueueName,
  async () => {
    const now = new Date();
    const { listings, specialists } = await expirePromotions(now);

    if (!listings.length && !specialists.length) {
      logger.debug('No promotions to expire at this time');
      return;
    }

    await Promise.all(
      listings.map((listingId) =>
        listingIndexQueue.add(
          'reindex-listing',
          { listingId, reason: 'promotion-expired' },
          { removeOnComplete: true, removeOnFail: true }
        )
      )
    );

    logger.info({ listings, specialists }, 'Expired promotions processed');
  },
  { connection }
);

promotionWorker.on('error', (error) => logger.error({ queue: promotionQueueName, error }, 'Worker error'));

const queues = [listingIndexQueueName, 'promotion', 'autobump'];
const genericWorkers: Worker[] = [];

queues.forEach((queueName) => {
  const worker = new Worker(
    queueName,
    async (job) => {
      logger.info({ queue: queueName, jobId: job.id, name: job.name, data: job.data }, 'Processing job');
      // TODO: implement domain logic in later phases
    },
    { connection }
  );

  worker.on('error', (error) => logger.error({ queue: queueName, error }, 'Worker error'));
  genericWorkers.push(worker);
});

async function schedulePromotionExpiry() {
  await promotionScheduler.waitUntilReady();
  const cron = process.env.WORKER_CRON_EXPIRE_PROMOS ?? '0 * * * *';

  await promotionQueue.add(
    'expire-promotions',
    {},
    {
      repeat: { cron },
      jobId: 'promotion-expire'
    }
  );

  logger.info({ cron }, 'Scheduled promotion expiry job');
}

async function bootstrap() {
  await prisma.$connect();
  await schedulePromotionExpiry();
  logger.info({ queues: [...queues, promotionQueueName] }, 'Workers bootstrapped');
}

bootstrap().catch((error) => {
  logger.error({ error }, 'Failed to bootstrap workers');
  process.exit(1);
});

const shutdown = async () => {
  logger.info('Shutting down workers');
  await Promise.all(queueEventsRegistry.map((events) => events.close()));
  await promotionWorker.close();
  await Promise.all(genericWorkers.map((worker) => worker.close()));
  await listingIndexQueue.close();
  await promotionQueue.close();
  await promotionScheduler.close();
  await prisma.$disconnect();
  await connection.quit();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
