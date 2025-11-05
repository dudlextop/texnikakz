import { ApiProperty } from '@nestjs/swagger';
import { DealType, SellerType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min
} from 'class-validator';

export class CreateListingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  categoryId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceKzt?: number;

  @ApiProperty({ required: false, default: 'KZT' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  priceCurrency?: string;

  @ApiProperty({ enum: DealType, default: DealType.SALE })
  @IsOptional()
  @IsEnum(DealType)
  dealType?: DealType;

  @ApiProperty({ enum: SellerType, default: SellerType.PRIVATE })
  @IsOptional()
  @IsEnum(SellerType)
  sellerType?: SellerType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  regionId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  cityId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  latitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  longitude?: number;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  params?: Record<string, any>;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  specs?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contactMasked?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  dealerId?: string;
}
