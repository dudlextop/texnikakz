import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminStatsOverviewDto } from '../dto/admin-stats-overview.dto';
import { AdminStatsService } from '../services/admin-stats.service';

@ApiTags('admin-stats')
@ApiCookieAuth()
@Controller('admin/stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MODERATOR)
export class AdminStatsController {
  constructor(private readonly adminStatsService: AdminStatsService) {}

  @Get('overview')
  @ApiOkResponse({ type: AdminStatsOverviewDto })
  getOverview() {
    return this.adminStatsService.getOverview();
  }
}
