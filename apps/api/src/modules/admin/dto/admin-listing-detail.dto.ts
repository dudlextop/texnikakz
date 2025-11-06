import { ApiProperty } from '@nestjs/swagger';
import { ListingStatus, SellerType } from '@prisma/client';
import { ListingMediaDto } from '../../listings/dto/listing-media.dto';

class AdminListingDealerDto {
  @ApiProperty({ nullable: true })
  id!: string | null;

  @ApiProperty({ nullable: true })
  name!: string | null;
}

class AdminListingLocationDto {
  @ApiProperty({ nullable: true })
  id!: string | null;

  @ApiProperty({ nullable: true })
  name!: string | null;
}

class AdminListingMetaDto {
  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ nullable: true })
  publishedAt!: Date | null;

  @ApiProperty({ nullable: true })
  expiresAt!: Date | null;

  @ApiProperty({ nullable: true })
  moderationReason!: string | null;

  @ApiProperty()
  boostScore!: number;
}

export class AdminListingDetailDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: ListingStatus })
  status!: ListingStatus;

  @ApiProperty({ enum: SellerType })
  sellerType!: SellerType;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty({ nullable: true })
  categoryId!: string | null;

  @ApiProperty({ nullable: true })
  priceKzt!: string | null;

  @ApiProperty({ nullable: true })
  priceCurrency!: string | null;

  @ApiProperty({ nullable: true })
  params!: Record<string, any> | null;

  @ApiProperty({ nullable: true })
  specs!: Record<string, any> | null;

  @ApiProperty({ nullable: true })
  contactMasked!: string | null;

  @ApiProperty({ type: () => [ListingMediaDto] })
  media!: ListingMediaDto[];

  @ApiProperty({ type: () => AdminListingDealerDto })
  dealer!: AdminListingDealerDto;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ type: () => AdminListingLocationDto })
  region!: AdminListingLocationDto;

  @ApiProperty({ type: () => AdminListingLocationDto })
  city!: AdminListingLocationDto;

  @ApiProperty({ type: () => AdminListingMetaDto })
  meta!: AdminListingMetaDto;
}
