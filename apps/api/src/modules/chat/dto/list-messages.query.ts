import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class ListMessagesQueryDto {
  @ApiPropertyOptional({ description: 'ID сообщения для постраничной выборки' })
  @IsOptional()
  @IsString()
  @IsUUID()
  cursor?: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  direction?: 'forward' | 'backward';
}
