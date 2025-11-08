import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class WalletTransactionDto {
  @ApiProperty({ description: 'Transaction identifier' })
  id!: string;

  @ApiProperty({ enum: TransactionType, description: 'Transaction direction' })
  type!: TransactionType;

  @ApiProperty({ description: 'Amount in KZT' })
  amountKzt!: number;

  @ApiProperty({ description: 'Related order identifier', required: false, nullable: true })
  orderId!: string | null;

  @ApiProperty({ description: 'Additional metadata payload', required: false, nullable: true })
  meta!: Record<string, any> | null;

  @ApiProperty({ description: 'When the transaction occurred' })
  createdAt!: Date;
}

export class WalletDto {
  @ApiProperty({ description: 'Wallet identifier' })
  id!: string;

  @ApiProperty({ description: 'Owner identifier' })
  userId!: string;

  @ApiProperty({ description: 'Current wallet balance in KZT' })
  balanceKzt!: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;

  @ApiProperty({ type: [WalletTransactionDto], description: 'Recent transactions sorted by newest first' })
  transactions!: WalletTransactionDto[];
}
