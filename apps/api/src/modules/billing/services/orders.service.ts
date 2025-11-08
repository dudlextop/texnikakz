import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import {
  BillingProvider,
  Order,
  OrderItem,
  OrderStatus,
  PricingPlan,
  PricingPlanCode,
  PromotionSubjectType,
  UserRole,
  Prisma
} from '@prisma/client';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { PrismaService } from '../../database/prisma.service';
import { SearchSyncService } from '../../search/search-sync.service';
import { CreateOrderDto, CreateOrderItemDto } from '../dto/create-order.dto';
import { MockWebhookDto } from '../dto/mock-webhook.dto';
import { OrderDto } from '../dto/order.dto';
import { PayOrderMode } from '../dto/pay-order.dto';
import { WalletService } from './wallet.service';

interface ActivationTarget {
  subjectType: PromotionSubjectType;
  subjectId: string;
}

type OrderWithItems = Order & { items: OrderItem[] };

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly searchSyncService: SearchSyncService
  ) {}

  async createOrder(user: AuthenticatedUser, dto: CreateOrderDto): Promise<OrderDto> {
    if (!dto.items?.length) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const planCodes = [...new Set(dto.items.map((item) => item.planCode))];
    const plans = await this.prisma.pricingPlan.findMany({
      where: { code: { in: planCodes }, active: true }
    });
    const planByCode = new Map<PricingPlanCode, PricingPlan>(plans.map((plan) => [plan.code, plan]));

    dto.items.forEach((item) => {
      if (!planByCode.has(item.planCode)) {
        throw new NotFoundException(`Pricing plan ${item.planCode} is not available`);
      }
    });

    await Promise.all(dto.items.map((item) => this.ensureSubjectAccess(item, user)));

    const totalKzt = dto.items.reduce((sum, item) => {
      const plan = planByCode.get(item.planCode)!;
      return sum + plan.priceKzt;
    }, 0);

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: user.id,
          status: OrderStatus.PENDING,
          totalKzt,
          provider: BillingProvider.MOCK,
          metadata: { createdBy: user.id }
        }
      });

      await Promise.all(
        dto.items.map((item) => {
          const plan = planByCode.get(item.planCode)!;
          return tx.orderItem.create({
            data: {
              orderId: created.id,
              subjectType: item.subjectType,
              subjectId: item.subjectId,
              planCode: item.planCode,
              priceKzt: plan.priceKzt,
              durationDays: plan.durationDays
            }
          });
        })
      );

      const orderWithItems = await tx.order.findUnique({
        where: { id: created.id },
        include: { items: true }
      });

      return orderWithItems!;
    });

    this.logger.log(`Created order ${order.id} for user ${user.id}`);
    return this.toOrderDto(order);
  }

  async payOrder(orderId: string, user: AuthenticatedUser, mode: PayOrderMode): Promise<OrderDto> {
    const [order, subjects] = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      });
      if (!existing) {
        throw new NotFoundException('Order not found');
      }
      if (existing.userId !== user.id && !this.isAdmin(user)) {
        throw new ForbiddenException('Not allowed to pay this order');
      }
      if (existing.status === OrderStatus.PAID) {
        return [existing, [] as ActivationTarget[]] as const;
      }
      if (existing.status !== OrderStatus.PENDING) {
        throw new BadRequestException(`Order is in ${existing.status} state and cannot be paid`);
      }

      if (mode === PayOrderMode.WALLET) {
        await this.walletService.debit(user.id, existing.totalKzt, existing.id, tx);
      }

      const updated = await this.markOrderPaid(tx, existing, mode, {
        processedBy: user.id,
        paymentMode: mode
      });
      const subjects = await this.activatePromotions(tx, updated.items);
      return [updated, subjects] as const;
    });

    await this.reindexSubjects(subjects);

    this.logger.log(`Order ${order.id} paid via ${mode}`);
    return this.toOrderDto(order);
  }

  async listOrdersForUser(userId: string): Promise<OrderDto[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });

    return orders.map((order) => this.toOrderDto(order));
  }

  async handleMockWebhook(dto: MockWebhookDto): Promise<OrderDto> {
    const [order, subjects] = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id: dto.orderId },
        include: { items: true }
      });
      if (!existing) {
        throw new NotFoundException('Order not found');
      }

      if (dto.status === OrderStatus.PAID) {
        if (existing.status === OrderStatus.PAID) {
          return [existing, [] as ActivationTarget[]] as const;
        }
        if (existing.status !== OrderStatus.PENDING) {
          throw new BadRequestException(`Cannot mark order ${dto.status} from state ${existing.status}`);
        }
        const updated = await this.markOrderPaid(tx, existing, PayOrderMode.CARD, {
          webhook: 'mock_psp'
        });
        const subjects = await this.activatePromotions(tx, updated.items);
        return [updated, subjects] as const;
      }

      if (existing.status === dto.status) {
        return [existing, [] as ActivationTarget[]] as const;
      }

      const cancelledAt = dto.status === OrderStatus.CANCELLED ? new Date() : existing.cancelledAt;
      const updated = await tx.order.update({
        where: { id: existing.id },
        data: {
          status: dto.status,
          cancelledAt,
          metadata: this.mergeMetadata(existing.metadata, { webhook: dto.status })
        },
        include: { items: true }
      });

      return [updated, [] as ActivationTarget[]] as const;
    });

    await this.reindexSubjects(subjects);
    this.logger.debug(`Processed mock webhook for order ${order.id} with status ${order.status}`);
    return this.toOrderDto(order);
  }

  private async ensureSubjectAccess(item: CreateOrderItemDto, user: AuthenticatedUser): Promise<void> {
    if (item.subjectType === PromotionSubjectType.LISTING) {
      const listing = await this.prisma.listing.findUnique({ where: { id: item.subjectId } });
      if (!listing) {
        throw new NotFoundException('Listing not found');
      }
      if (this.isAdmin(user)) {
        return;
      }
      if (listing.userId === user.id) {
        return;
      }
      if (listing.dealerId && user.dealerId && listing.dealerId === user.dealerId) {
        return;
      }
      throw new ForbiddenException('Not allowed to promote this listing');
    }

    if (item.subjectType === PromotionSubjectType.SPECIALIST) {
      const specialist = await this.prisma.specialist.findUnique({ where: { id: item.subjectId } });
      if (!specialist) {
        throw new NotFoundException('Specialist not found');
      }
      if (this.isAdmin(user)) {
        return;
      }
      if (specialist.userId && specialist.userId === user.id) {
        return;
      }
      throw new ForbiddenException('Not allowed to promote this specialist');
    }

    throw new BadRequestException('Unsupported subject type');
  }

  private async markOrderPaid(
    tx: Prisma.TransactionClient,
    order: OrderWithItems,
    mode: PayOrderMode,
    metadataPatch: Record<string, any>
  ): Promise<OrderWithItems> {
    return tx.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.PAID,
        paymentMode: mode,
        paidAt: new Date(),
        metadata: this.mergeMetadata(order.metadata, metadataPatch)
      },
      include: { items: true }
    });
  }

  private async activatePromotions(
    tx: Prisma.TransactionClient,
    items: OrderItem[]
  ): Promise<ActivationTarget[]> {
    const now = new Date();
    const subjects = new Map<string, PromotionSubjectType>();

    for (const item of items) {
      const expiresAt = new Date(now.getTime() + item.durationDays * 86_400_000);
      await tx.promotionActivation.create({
        data: {
          subjectType: item.subjectType,
          subjectId: item.subjectId,
          planCode: item.planCode,
          startedAt: now,
          expiresAt,
          orderItemId: item.id
        }
      });
      subjects.set(`${item.subjectType}:${item.subjectId}`, item.subjectType);
    }

    return Array.from(subjects.entries()).map(([key, subjectType]) => {
      const [, subjectId] = key.split(':');
      return { subjectType, subjectId };
    });
  }

  private async reindexSubjects(subjects: ActivationTarget[]): Promise<void> {
    await Promise.all(
      subjects.map(async ({ subjectType, subjectId }) => {
        try {
          if (subjectType === PromotionSubjectType.LISTING) {
            await this.searchSyncService.syncListingById(subjectId);
          } else {
            this.logger.debug(`Specialist ${subjectId} promotion activated (no search index yet)`);
          }
        } catch (error) {
          this.logger.warn(`Failed to reindex ${subjectType} ${subjectId}`, error as Error);
        }
      })
    );
  }

  private mergeMetadata(meta: any, patch: Record<string, any>): Record<string, any> {
    const base = (meta as Record<string, any> | null) ?? {};
    return { ...base, ...patch };
  }

  private toOrderDto(order: OrderWithItems): OrderDto {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      totalKzt: order.totalKzt,
      provider: order.provider,
      paymentMode: order.paymentMode,
      metadata: (order.metadata as Record<string, any> | null) ?? null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      paidAt: order.paidAt,
      cancelledAt: order.cancelledAt,
      items: order.items.map((item) => ({
        id: item.id,
        subjectType: item.subjectType,
        subjectId: item.subjectId,
        planCode: item.planCode,
        priceKzt: item.priceKzt,
        durationDays: item.durationDays,
        createdAt: item.createdAt
      }))
    };
  }

  private isAdmin(user: AuthenticatedUser): boolean {
    return user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR;
  }
}
