import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class MockWebhookDto {
  @ApiProperty({ description: 'Order identifier from Texnika billing system' })
  @IsString()
  orderId!: string;

  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}
