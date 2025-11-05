import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectListingDto {
  @ApiPropertyOptional({ description: 'Причина отклонения' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
