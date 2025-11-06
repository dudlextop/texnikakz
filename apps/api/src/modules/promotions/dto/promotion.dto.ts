import { ApiProperty } from '@nestjs/swagger';
import { PromotionType } from '@prisma/client';

export class PromotionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  listingId!: string;

  @ApiProperty({ enum: PromotionType })
  type!: PromotionType;

  @ApiProperty()
  startsAt!: Date;

  @ApiProperty()
  endsAt!: Date;

  @ApiProperty({ nullable: true, type: Object })
  meta?: Record<string, any> | null;
}
