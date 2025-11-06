import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { CreateSpecialistDto } from './dto/create-specialist.dto';
import { SpecialistDto } from './dto/specialist.dto';
import { SpecialistListResponseDto } from './dto/specialist-list-response.dto';
import { SpecialistQueryDto } from './dto/specialist-query.dto';
import { UpdateSpecialistDto } from './dto/update-specialist.dto';
import { SpecialistsService } from './specialists.service';

@ApiTags('specialists')
@Controller('specialists')
export class SpecialistsController {
  constructor(private readonly specialistsService: SpecialistsService) {}

  @Get()
  @ApiOkResponse({ type: SpecialistListResponseDto })
  list(@Query() query: SpecialistQueryDto) {
    return this.specialistsService.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: SpecialistDto })
  findOne(@Param('id') id: string) {
    return this.specialistsService.findPublic(id);
  }

  @Post()
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: SpecialistDto })
  create(@Body() dto: CreateSpecialistDto, @CurrentUser() user: AuthenticatedUser) {
    return this.specialistsService.create(dto, user);
  }

  @Put(':id')
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: SpecialistDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSpecialistDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.specialistsService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Specialist removed' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.specialistsService.remove(id, user);
  }
}
