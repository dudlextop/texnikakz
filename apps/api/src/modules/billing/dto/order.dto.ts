import { ApiProperty } from '@nestjs/swagger';
import { BillingProvider, OrderStatus, PricingPlanCode, PromotionSubjectType } from '@prisma/client';
import { WalletTransactionDto } from './wallet.dto';

export class OrderItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: PromotionSubjectType })
  subjectType!: PromotionSubjectType;

  @ApiProperty()
  subjectId!: string;

  @ApiProperty({ enum: PricingPlanCode })
  planCode!: PricingPlanCode;

  @ApiProperty()
  priceKzt!: number;

  @ApiProperty()
  durationDays!: number;

  @ApiProperty()
  createdAt!: Date;
}

export class OrderDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: OrderStatus })
  status!: OrderStatus;

  @ApiProperty()
  totalKzt!: number;

  @ApiProperty({ enum: BillingProvider })
  provider!: BillingProvider;

  @ApiProperty({ description: 'Payment mode used for the order', required: false, nullable: true })
  paymentMode!: string | null;

  @ApiProperty({ description: 'Provider specific metadata', required: false, nullable: true })
  metadata!: Record<string, any> | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ required: false, nullable: true })
  paidAt!: Date | null;

  @ApiProperty({ required: false, nullable: true })
  cancelledAt!: Date | null;

  @ApiProperty({ type: [OrderItemDto] })
  items!: OrderItemDto[];

  @ApiProperty({ type: [WalletTransactionDto], required: false, description: 'Transactions linked to this order' })
  transactions?: WalletTransactionDto[];
}
