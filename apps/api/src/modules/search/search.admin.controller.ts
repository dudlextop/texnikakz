import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SearchSyncService } from './search-sync.service';

@ApiTags('admin/search')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/search')
export class SearchAdminController {
  constructor(private readonly searchSyncService: SearchSyncService) {}

  @Post('reindex')
  @ApiOkResponse({ description: 'Triggered listings search reindex', schema: { properties: { indexed: { type: 'number' } } } })
  async reindex() {
    const indexed = await this.searchSyncService.reindexAll();
    return { indexed };
  }
}
