import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMimeType, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export enum MediaTargetType {
  LISTING = 'listing',
  SPECIALIST = 'specialist'
}

export class PresignMediaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @ApiProperty({ enum: MediaTargetType })
  @IsEnum(MediaTargetType)
  target!: MediaTargetType;

  @ApiProperty({ default: 'image/jpeg' })
  @IsString()
  @IsMimeType()
  contentType!: string;

  @ApiProperty({ type: Number, description: 'Размер файла в байтах' })
  @IsNumber()
  @Min(1)
  @Max(25 * 1024 * 1024)
  fileSize!: number;

  @ApiProperty({ required: false, description: 'ID листинга или специалиста для формирования пути' })
  @IsOptional()
  @IsString()
  referenceId?: string;
}
