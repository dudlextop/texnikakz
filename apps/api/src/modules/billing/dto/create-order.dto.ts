import { ApiProperty } from '@nestjs/swagger';
import { PricingPlanCode, PromotionSubjectType } from '@prisma/client';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsString, ValidateNested } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({ enum: PromotionSubjectType })
  @IsEnum(PromotionSubjectType)
  subjectType!: PromotionSubjectType;

  @ApiProperty({ description: 'Identifier of listing or specialist to promote' })
  @IsString()
  subjectId!: string;

  @ApiProperty({ enum: PricingPlanCode })
  @IsEnum(PricingPlanCode)
  planCode!: PricingPlanCode;
}

export class CreateOrderDto {
  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
