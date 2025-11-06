import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateDealerDto } from './dto/create-dealer.dto';
import { DealerDto } from './dto/dealer.dto';
import { DealerStatsDto } from './dto/dealer-stats.dto';
import { UpdateDealerDto } from './dto/update-dealer.dto';
import { DealersService } from './dealers.service';

@ApiTags('dealers')
@Controller('dealers')
export class DealersController {
  constructor(private readonly dealersService: DealersService) {}

  @Post()
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiCreatedResponse({ type: DealerDto })
  create(@Body() dto: CreateDealerDto) {
    return this.dealersService.create(dto);
  }

  @Put(':id')
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOkResponse({ type: DealerDto })
  update(@Param('id') id: string, @Body() dto: UpdateDealerDto) {
    return this.dealersService.update(id, dto);
  }

  @Delete(':id')
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOkResponse({ description: 'Dealer deleted' })
  remove(@Param('id') id: string) {
    return this.dealersService.remove(id);
  }

  @Get(':id')
  @ApiOkResponse({ type: DealerDto })
  findOne(@Param('id') id: string) {
    return this.dealersService.findPublic(id);
  }

  @Get(':id/stats')
  @ApiOkResponse({ type: DealerStatsDto })
  stats(@Param('id') id: string) {
    return this.dealersService.stats(id);
  }
}
