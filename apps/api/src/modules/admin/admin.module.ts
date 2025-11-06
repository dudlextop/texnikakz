import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ListingsModule } from '../listings/listings.module';
import { AdminListingsController } from './controllers/admin-listings.controller';
import { AdminStatsController } from './controllers/admin-stats.controller';
import { AdminListingsService } from './services/admin-listings.service';
import { AdminStatsService } from './services/admin-stats.service';

@Module({
  imports: [DatabaseModule, ListingsModule],
  controllers: [AdminListingsController, AdminStatsController],
  providers: [AdminListingsService, AdminStatsService],
  exports: [AdminListingsService, AdminStatsService],
})
export class AdminModule {}
