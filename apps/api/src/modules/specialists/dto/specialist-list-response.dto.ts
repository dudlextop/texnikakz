import { ApiProperty } from '@nestjs/swagger';
import { SpecialistDto } from './specialist.dto';

export class SpecialistCategoryFacetDto {
  @ApiProperty()
  categoryId!: string;

  @ApiProperty()
  count!: number;
}

export class SpecialistListResponseDto {
  @ApiProperty({ type: () => [SpecialistDto] })
  items!: SpecialistDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  offset!: number;

  @ApiProperty({ type: () => [SpecialistCategoryFacetDto] })
  categoryFacets!: SpecialistCategoryFacetDto[];
}
