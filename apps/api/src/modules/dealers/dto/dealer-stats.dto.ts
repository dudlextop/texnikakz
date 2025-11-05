import { ApiProperty } from '@nestjs/swagger';

export class DealerStatsDto {
  @ApiProperty()
  dealerId!: string;

  @ApiProperty()
  listingsTotal!: number;

  @ApiProperty()
  listingsPublished!: number;

  @ApiProperty()
  ordersTotal!: number;

  @ApiProperty()
  membersTotal!: number;
}
