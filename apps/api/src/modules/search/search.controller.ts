import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ListingsSearchResponse } from '@texnika/shared';
import { ListingQueryDto } from '../listings/dto/listing-query.dto';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('listings')
  @ApiOkResponse({ description: 'Listings search response', type: Object })
  searchListings(@Query() query: ListingQueryDto): Promise<ListingsSearchResponse> {
    return this.searchService.searchListings(query);
  }
}
