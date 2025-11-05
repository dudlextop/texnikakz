import { ApiProperty } from '@nestjs/swagger';
import { PromotionType } from '@prisma/client';
import { IsEnum, IsInt, IsPositive } from 'class-validator';

export class ApplyPromotionDto {
  @ApiProperty({ enum: PromotionType })
  @IsEnum(PromotionType)
  type!: PromotionType;

  @ApiProperty({ default: 7 })
  @IsInt()
  @IsPositive()
  days!: number;
}
