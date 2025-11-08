import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum PayOrderMode {
  WALLET = 'wallet',
  CARD = 'card'
}

export class PayOrderDto {
  @ApiPropertyOptional({ enum: PayOrderMode, default: PayOrderMode.WALLET })
  @IsOptional()
  @IsEnum(PayOrderMode)
  mode?: PayOrderMode;
}
