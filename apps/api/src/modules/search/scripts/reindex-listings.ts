import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { SearchSyncService } from '../search-sync.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn']
  });
  const logger = new Logger('SearchReindexCommand');

  try {
    const searchSyncService = app.get(SearchSyncService);
    const indexed = await searchSyncService.reindexAll();
    logger.log(`Reindexed ${indexed} listings into OpenSearch index.`);
  } finally {
    await app.close();
  }
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Reindex failed', error);
  process.exit(1);
});
