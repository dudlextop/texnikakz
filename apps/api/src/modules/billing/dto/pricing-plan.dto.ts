import { ApiProperty } from '@nestjs/swagger';
import { PricingPlanCode } from '@prisma/client';

export class PricingPlanDto {
  @ApiProperty({ description: 'Unique identifier of the pricing plan' })
  id!: string;

  @ApiProperty({ enum: PricingPlanCode, description: 'Promotion code for the plan' })
  code!: PricingPlanCode;

  @ApiProperty({ description: 'Display title for the plan' })
  title!: string;

  @ApiProperty({ description: 'Localized description for the plan', required: false, nullable: true })
  description!: string | null;

  @ApiProperty({ description: 'Price in KZT' })
  priceKzt!: number;

  @ApiProperty({ description: 'Promotion duration in days' })
  durationDays!: number;

  @ApiProperty({ description: 'Whether plan is currently sellable' })
  active!: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;
}
