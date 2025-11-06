import { ApiPropertyOptional } from '@nestjs/swagger';
import { SpecialistAvailability } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min
} from 'class-validator';

export enum SpecialistSortOption {
  RATING_DESC = 'rating_desc',
  EXPERIENCE_DESC = 'experience_desc',
  PRICE_ASC = 'price_asc',
  REVIEWS_DESC = 'reviews_desc'
}

export class SpecialistQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  cityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  regionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  skill?: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rateFrom?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rateTo?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  experience?: number;

  @ApiPropertyOptional({ enum: SpecialistAvailability })
  @IsOptional()
  @IsEnum(SpecialistAvailability)
  availability?: SpecialistAvailability;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasEquipment?: boolean;

  @ApiPropertyOptional({ enum: SpecialistSortOption, default: SpecialistSortOption.RATING_DESC })
  @IsOptional()
  @IsEnum(SpecialistSortOption)
  sort?: SpecialistSortOption;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;
}
