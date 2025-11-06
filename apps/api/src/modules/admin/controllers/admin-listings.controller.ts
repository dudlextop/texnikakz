import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { RejectListingDto } from '../../listings/dto/moderate-listing.dto';
import { AdminListingDetailDto } from '../dto/admin-listing-detail.dto';
import { AdminListingListResponseDto } from '../dto/admin-listing-summary.dto';
import { AdminListingQueryDto } from '../dto/admin-listing-query.dto';
import { BulkModerateListingsDto, BulkModerationResultDto } from '../dto/bulk-moderate.dto';
import { AdminListingsService } from '../services/admin-listings.service';

@ApiTags('admin-listings')
@ApiCookieAuth()
@Controller('admin/listings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MODERATOR)
export class AdminListingsController {
  constructor(private readonly adminListingsService: AdminListingsService) {}

  @Get()
  @ApiOkResponse({ type: AdminListingListResponseDto })
  list(@Query() query: AdminListingQueryDto) {
    return this.adminListingsService.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: AdminListingDetailDto })
  detail(@Param('id') id: string) {
    return this.adminListingsService.findById(id);
  }

  @Post(':id/publish')
  @ApiOkResponse({ description: 'Listing published' })
  publish(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.adminListingsService.publish(id, user);
  }

  @Post(':id/reject')
  @ApiOkResponse({ description: 'Listing rejected' })
  reject(
    @Param('id') id: string,
    @Body() dto: RejectListingDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminListingsService.reject(id, user, dto.reason ?? undefined);
  }

  @Post('bulk')
  @ApiOkResponse({ type: BulkModerationResultDto })
  bulkModerate(@Body() dto: BulkModerateListingsDto, @CurrentUser() user: AuthenticatedUser) {
    return this.adminListingsService.bulkModerate(dto, user);
  }
}
