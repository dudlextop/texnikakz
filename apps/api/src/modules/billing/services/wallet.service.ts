import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma, Transaction as TransactionModel, TransactionType, Wallet as WalletModel } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { WalletDto, WalletTransactionDto } from '../dto/wallet.dto';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  private readonly recentTransactionsLimit = 25;

  constructor(private readonly prisma: PrismaService) {}

  async getWallet(userId: string): Promise<WalletDto> {
    const wallet = await this.ensureWallet(this.prisma, userId);
    const transactions = await this.prisma.transaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: this.recentTransactionsLimit
    });

    return this.toWalletDto(wallet, transactions);
  }

  async topUp(userId: string, amountKzt: number): Promise<WalletDto> {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await this.ensureWallet(tx, userId);
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balanceKzt: { increment: amountKzt }
        }
      });

      await tx.transaction.create({
        data: {
          walletId: updatedWallet.id,
          type: TransactionType.CREDIT,
          amountKzt,
          meta: {
            source: 'mock_topup'
          }
        }
      });

      const transactions = await tx.transaction.findMany({
        where: { walletId: updatedWallet.id },
        orderBy: { createdAt: 'desc' },
        take: this.recentTransactionsLimit
      });

      this.logger.debug(`Wallet ${updatedWallet.id} topped up by ${amountKzt}₸`);

      return this.toWalletDto(updatedWallet, transactions);
    });
  }

  async listTransactions(userId: string, limit = 50): Promise<WalletTransactionDto[]> {
    const wallet = await this.ensureWallet(this.prisma, userId);
    const transactions = await this.prisma.transaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return transactions.map((tx) => this.toTransactionDto(tx));
  }

  async debit(
    userId: string,
    amountKzt: number,
    orderId: string | null,
    client?: Prisma.TransactionClient
  ): Promise<void> {
    const prismaClient = client ?? this.prisma;
    const wallet = await this.ensureWallet(prismaClient, userId);

    if (wallet.balanceKzt < amountKzt) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    const updatedWallet = await prismaClient.wallet.update({
      where: { id: wallet.id },
      data: {
        balanceKzt: { decrement: amountKzt }
      }
    });

    await prismaClient.transaction.create({
      data: {
        walletId: updatedWallet.id,
        orderId,
        type: TransactionType.DEBIT,
        amountKzt,
        meta: {
          source: 'wallet',
          reason: 'order_payment'
        }
      }
    });

    this.logger.debug(`Wallet ${updatedWallet.id} debited by ${amountKzt}₸ for order ${orderId ?? 'n/a'}`);
  }

  private async ensureWallet(
    client: Prisma.TransactionClient | PrismaService,
    userId: string
  ): Promise<WalletModel> {
    const existing = await client.wallet.findUnique({ where: { userId } });
    if (existing) {
      return existing;
    }

    return client.wallet.create({ data: { userId } });
  }

  private toWalletDto(wallet: WalletModel, transactions: TransactionModel[]): WalletDto {
    return {
      id: wallet.id,
      userId: wallet.userId,
      balanceKzt: wallet.balanceKzt,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
      transactions: transactions.map((tx) => this.toTransactionDto(tx))
    };
  }

  private toTransactionDto(tx: TransactionModel): WalletTransactionDto {
    return {
      id: tx.id,
      type: tx.type,
      amountKzt: tx.amountKzt,
      orderId: tx.orderId,
      meta: (tx.meta as Record<string, any> | null) ?? null,
      createdAt: tx.createdAt
    };
  }
}
