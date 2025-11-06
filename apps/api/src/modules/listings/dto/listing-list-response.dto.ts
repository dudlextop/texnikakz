import { ApiProperty } from '@nestjs/swagger';
import { ListingDto } from './listing.dto';

export class CategoryFacetDto {
  @ApiProperty()
  categoryId!: string;

  @ApiProperty()
  count!: number;
}

export class ListingListResponseDto {
  @ApiProperty({ type: () => [ListingDto] })
  items!: ListingDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  offset!: number;

  @ApiProperty({ type: () => [CategoryFacetDto] })
  categoryFacets!: CategoryFacetDto[];
}
