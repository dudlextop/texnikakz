import { ApiProperty } from '@nestjs/swagger';
import { DealerPlan } from '@prisma/client';

export class DealerDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ nullable: true })
  innIin?: string | null;

  @ApiProperty({ nullable: true })
  description?: string | null;

  @ApiProperty({ nullable: true })
  website?: string | null;

  @ApiProperty({ type: () => [Object], required: false })
  addresses?: Record<string, any>[] | null;

  @ApiProperty({ enum: DealerPlan })
  plan!: DealerPlan;

  @ApiProperty({ nullable: true })
  logoKey?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
