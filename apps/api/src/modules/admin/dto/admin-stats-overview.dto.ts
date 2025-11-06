import { ApiProperty } from '@nestjs/swagger';

class AdminStatsCountDto {
  @ApiProperty()
  totalListings!: number;

  @ApiProperty()
  pendingListings!: number;

  @ApiProperty()
  publishedListings!: number;

  @ApiProperty()
  dealers!: number;

  @ApiProperty()
  specialists!: number;

  @ApiProperty()
  paidOrders!: number;

  @ApiProperty()
  activePromotions!: number;
}

class AdminStatsActivityPointDto {
  @ApiProperty()
  date!: string;

  @ApiProperty()
  publishedListings!: number;

  @ApiProperty()
  pendingListings!: number;

  @ApiProperty()
  specialists!: number;
}

export class AdminStatsOverviewDto {
  @ApiProperty({ type: () => AdminStatsCountDto })
  counts!: AdminStatsCountDto;

  @ApiProperty({ type: () => [AdminStatsActivityPointDto] })
  activity!: AdminStatsActivityPointDto[];
}
