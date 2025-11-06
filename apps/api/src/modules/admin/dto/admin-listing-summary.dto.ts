import { ApiProperty } from '@nestjs/swagger';
import { ListingStatus } from '@prisma/client';

export class AdminListingSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ enum: ListingStatus })
  status!: ListingStatus;

  @ApiProperty({ nullable: true })
  dealerId!: string | null;

  @ApiProperty({ nullable: true })
  dealerName!: string | null;

  @ApiProperty({ nullable: true })
  cityId!: string | null;

  @ApiProperty({ nullable: true })
  cityName!: string | null;

  @ApiProperty({ nullable: true })
  categoryId!: string | null;

  @ApiProperty({ nullable: true })
  priceKzt!: string | null;

  @ApiProperty()
  boostScore!: number;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty()
  createdAt!: Date;
}

export class AdminListingListResponseDto {
  @ApiProperty({ type: () => [AdminListingSummaryDto] })
  items!: AdminListingSummaryDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  offset!: number;
}
