import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SearchController } from './search.controller';
import { SearchAdminController } from './search.admin.controller';
import { SearchService } from './search.service';
import { SearchSyncService } from './search-sync.service';
import { openSearchClientProvider } from './opensearch-client.provider';

@Module({
  imports: [ConfigModule],
  controllers: [SearchController, SearchAdminController],
  providers: [SearchService, SearchSyncService, openSearchClientProvider],
  exports: [SearchService, SearchSyncService, openSearchClientProvider]
})
export class SearchModule {}
