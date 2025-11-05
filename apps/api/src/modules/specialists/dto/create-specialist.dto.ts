import { ApiProperty } from '@nestjs/swagger';
import { SpecialistAvailability } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
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

export class CreateSpecialistDto {
  @ApiProperty()
  @IsUUID()
  categoryId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  profession!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ default: 0 })
  @IsNumber()
  @Min(0)
  experienceYears!: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rateHourly?: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rateShift?: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rateMonthly?: number;

  @ApiProperty({ enum: SpecialistAvailability, default: SpecialistAvailability.FULL_TIME })
  @IsOptional()
  @IsEnum(SpecialistAvailability)
  availability?: SpecialistAvailability;

  @ApiProperty({ default: false })
  @IsBoolean()
  hasOwnEquipment!: boolean;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  certifications?: Record<string, any>;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  regionsServed?: Record<string, any>;

  @ApiProperty({ type: () => [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  skills!: string[];

  @ApiProperty({ type: () => [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  regionId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  cityId?: string;
}
