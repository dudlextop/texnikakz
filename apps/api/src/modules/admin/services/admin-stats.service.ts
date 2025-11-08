import { Injectable } from '@nestjs/common';
import { ListingStatus, OrderStatus, PromotionActivationStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AdminStatsOverviewDto } from '../dto/admin-stats-overview.dto';

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildDateRange(days: number): string[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result: string[] = [];
  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    result.push(toDateKey(date));
  }
  return result;
}

@Injectable()
export class AdminStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(): Promise<AdminStatsOverviewDto> {
    const now = new Date();
    const dateRange = buildDateRange(7);
    const rangeStart = new Date(dateRange[0]);

    const [
      totalListings,
      pendingListings,
      publishedListings,
      dealerCount,
      specialistCount,
      paidOrders,
      activePromotions,
      publishedHistory,
      pendingHistory,
      specialistHistory,
    ] = await Promise.all([
      this.prisma.listing.count(),
      this.prisma.listing.count({ where: { status: ListingStatus.PENDING } }),
      this.prisma.listing.count({ where: { status: ListingStatus.PUBLISHED } }),
      this.prisma.dealer.count(),
      this.prisma.specialist.count(),
      this.prisma.order.count({ where: { status: OrderStatus.PAID } }),
      this.prisma.promotionActivation.count({
        where: {
          status: PromotionActivationStatus.ACTIVE,
          expiresAt: { gte: now }
        }
      }),
      this.prisma.listing.findMany({
        where: { publishedAt: { gte: rangeStart } },
        select: { publishedAt: true },
      }),
      this.prisma.listing.findMany({
        where: { status: ListingStatus.PENDING, updatedAt: { gte: rangeStart } },
        select: { updatedAt: true },
      }),
      this.prisma.specialist.findMany({
        where: { createdAt: { gte: rangeStart } },
        select: { createdAt: true },
      }),
    ]);

    const publishedMap = new Map<string, number>();
    publishedHistory.forEach((item) => {
      if (!item.publishedAt) return;
      const key = toDateKey(item.publishedAt);
      publishedMap.set(key, (publishedMap.get(key) ?? 0) + 1);
    });

    const pendingMap = new Map<string, number>();
    pendingHistory.forEach((item) => {
      const key = toDateKey(item.updatedAt);
      pendingMap.set(key, (pendingMap.get(key) ?? 0) + 1);
    });

    const specialistMap = new Map<string, number>();
    specialistHistory.forEach((item) => {
      const key = toDateKey(item.createdAt);
      specialistMap.set(key, (specialistMap.get(key) ?? 0) + 1);
    });

    const activity = dateRange.map((date) => ({
      date,
      publishedListings: publishedMap.get(date) ?? 0,
      pendingListings: pendingMap.get(date) ?? 0,
      specialists: specialistMap.get(date) ?? 0,
    }));

    return {
      counts: {
        totalListings,
        pendingListings,
        publishedListings,
        dealers: dealerCount,
        specialists: specialistCount,
        paidOrders,
        activePromotions,
      },
      activity,
    };
  }
}
