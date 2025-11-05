import { ApiProperty } from '@nestjs/swagger';
import { MediaKind } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class AttachMediaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bucket!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  objectKey!: string;

  @ApiProperty({ enum: MediaKind, default: MediaKind.IMAGE })
  @IsOptional()
  @IsEnum(MediaKind)
  kind?: MediaKind;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  listingId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  specialistId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  url?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  previewUrl?: string;
}
