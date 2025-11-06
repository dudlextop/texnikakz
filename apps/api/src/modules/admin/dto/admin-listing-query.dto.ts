import { ApiPropertyOptional } from '@nestjs/swagger';
import { ListingStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export enum AdminListingSortOption {
  UPDATED_DESC = 'updated_desc',
  CREATED_DESC = 'created_desc',
}

export class AdminListingQueryDto {
  @ApiPropertyOptional({ description: 'Поиск по ID, заголовку или описанию' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: ListingStatus })
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @ApiPropertyOptional({ description: 'Идентификатор дилера' })
  @IsOptional()
  @IsUUID()
  dealerId?: string;

  @ApiPropertyOptional({ description: 'Идентификатор города' })
  @IsOptional()
  @IsUUID()
  cityId?: string;

  @ApiPropertyOptional({ enum: AdminListingSortOption, default: AdminListingSortOption.UPDATED_DESC })
  @IsOptional()
  @IsEnum(AdminListingSortOption)
  sort?: AdminListingSortOption;

  @ApiPropertyOptional({ type: Number, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ type: Number, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;
}
