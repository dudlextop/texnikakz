import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class ListConversationsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  listingId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  specialistId?: string;
}
