import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ListingsModule } from '../listings/listings.module';
import { DatabaseModule } from '../database/database.module';
import { SearchController } from './search.controller';
import { SearchAdminController } from './search.admin.controller';
import { openSearchClientProvider } from './opensearch-client.provider';
import { SearchSyncService } from './search-sync.service';
import { SearchService } from './search.service';

@Module({
  imports: [ConfigModule, DatabaseModule, ListingsModule],
  controllers: [SearchController, SearchAdminController],
  providers: [SearchService, SearchSyncService, openSearchClientProvider],
  exports: [SearchService, SearchSyncService]
})
export class SearchModule {}
