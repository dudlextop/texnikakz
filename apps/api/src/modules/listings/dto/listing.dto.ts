import { ApiProperty } from '@nestjs/swagger';
import { DealType, ListingStatus, SellerType } from '@prisma/client';
import { ListingMediaDto } from './listing-media.dto';

export class ListingDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: ListingStatus })
  status!: ListingStatus;

  @ApiProperty({ enum: DealType })
  dealType!: DealType;

  @ApiProperty()
  categoryId!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty({ nullable: true, type: String })
  priceKzt?: string | null;

  @ApiProperty()
  priceCurrency!: string;

  @ApiProperty({ nullable: true })
  regionId?: string | null;

  @ApiProperty({ nullable: true })
  cityId?: string | null;

  @ApiProperty({ nullable: true })
  latitude?: number | null;

  @ApiProperty({ nullable: true })
  longitude?: number | null;

  @ApiProperty({ enum: SellerType })
  sellerType!: SellerType;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ nullable: true })
  dealerId?: string | null;

  @ApiProperty({ type: Object, required: false, nullable: true })
  params?: Record<string, any> | null;

  @ApiProperty({ type: Object, required: false, nullable: true })
  specs?: Record<string, any> | null;

  @ApiProperty({ nullable: true })
  contactMasked?: string | null;

  @ApiProperty({ nullable: true })
  expiresAt?: Date | null;

  @ApiProperty({ nullable: true })
  publishedAt?: Date | null;

  @ApiProperty()
  boostScore!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: () => [ListingMediaDto] })
  media!: ListingMediaDto[];
}
