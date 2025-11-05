import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { CreateListingDto } from './dto/create-listing.dto';
import { ListingDto } from './dto/listing.dto';
import { ListingListResponseDto } from './dto/listing-list-response.dto';
import { ListingQueryDto } from './dto/listing-query.dto';
import { RejectListingDto } from './dto/moderate-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { SearchService } from '../search/search.service';
import { ListingsService } from './listings.service';

@ApiTags('listings')
@Controller('listings')
export class ListingsController {
  constructor(
    private readonly listingsService: ListingsService,
    private readonly searchService: SearchService
  ) {}

  @Post()
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: ListingDto })
  create(@Body() dto: CreateListingDto, @CurrentUser() user: AuthenticatedUser) {
    return this.listingsService.create(dto, user);
  }

  @Put(':id')
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ListingDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateListingDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.listingsService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Listing removed' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.listingsService.remove(id, user);
  }

  @Post(':id/submit')
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ListingDto })
  submit(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.listingsService.submit(id, user);
  }

  @Post(':id/publish')
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOkResponse({ type: ListingDto })
  publish(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.listingsService.publish(id, user);
  }

  @Post(':id/reject')
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOkResponse({ type: ListingDto })
  reject(
    @Param('id') id: string,
    @Body() dto: RejectListingDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.listingsService.reject(id, user, dto);
  }

  @Get()
  @ApiOkResponse({ type: ListingListResponseDto })
  async findMany(@Query() query: ListingQueryDto) {
    const searchResult = await this.searchService.searchListings(query);
    const ids = searchResult.items.map((item) => item.id);
    const listings = await this.listingsService.findManyByIds(ids);
    const listingMap = new Map(listings.map((item) => [item.id, item]));
    const orderedItems = ids.map((id) => listingMap.get(id)).filter((item): item is ListingDto => Boolean(item));

    return {
      items: orderedItems,
      total: searchResult.total,
      limit: searchResult.limit,
      offset: searchResult.offset,
      categoryFacets: searchResult.facets.categories.map((facet) => ({
        categoryId: facet.id,
        count: facet.count
      }))
    } satisfies ListingListResponseDto;
  }

  @Get(':id')
  @ApiOkResponse({ type: ListingDto })
  findOne(@Param('id') id: string) {
    return this.listingsService.findPublic(id);
  }
}
