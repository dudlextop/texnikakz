import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class TopupWalletDto {
  @ApiProperty({ description: 'Amount to credit in KZT', minimum: 1 })
  @IsInt()
  @Min(1)
  amountKzt!: number;
}
