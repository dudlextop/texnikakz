import { ApiProperty } from '@nestjs/swagger';
import { DealerPlan } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, Matches, MaxLength, IsUrl } from 'class-validator';

export class CreateDealerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: 'kaztech-group' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  @MaxLength(255)
  slug!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(12)
  innIin?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true }, { message: 'website must include protocol (https://)' })
  website?: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  addresses?: Record<string, any>;

  @ApiProperty({ enum: DealerPlan, required: false, default: DealerPlan.FREE })
  @IsOptional()
  @IsEnum(DealerPlan)
  plan?: DealerPlan;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logoKey?: string;
}
