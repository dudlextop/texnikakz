import { ApiProperty } from '@nestjs/swagger';
import { SpecialistAvailability } from '@prisma/client';
import { SpecialistMediaDto } from './specialist-media.dto';

export class SpecialistDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ nullable: true })
  userId?: string | null;

  @ApiProperty()
  categoryId!: string;

  @ApiProperty()
  profession!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ nullable: true })
  bio?: string | null;

  @ApiProperty({ nullable: true })
  phone?: string | null;

  @ApiProperty()
  experienceYears!: number;

  @ApiProperty({ nullable: true })
  rateHourly?: string | null;

  @ApiProperty({ nullable: true })
  rateShift?: string | null;

  @ApiProperty({ nullable: true })
  rateMonthly?: string | null;

  @ApiProperty({ enum: SpecialistAvailability })
  availability!: SpecialistAvailability;

  @ApiProperty()
  hasOwnEquipment!: boolean;

  @ApiProperty({ type: Object, nullable: true })
  certifications?: Record<string, any> | null;

  @ApiProperty({ type: Object, nullable: true })
  regionsServed?: Record<string, any> | null;

  @ApiProperty({ type: () => [String] })
  skills!: string[];

  @ApiProperty({ type: () => [String] })
  languages!: string[];

  @ApiProperty()
  rating!: number;

  @ApiProperty()
  reviewsCount!: number;

  @ApiProperty({ nullable: true })
  regionId?: string | null;

  @ApiProperty({ nullable: true })
  cityId?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: () => [SpecialistMediaDto] })
  portfolio!: SpecialistMediaDto[];
}
