import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SellerType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ListingsService } from '../../listings/listings.service';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { AdminListingQueryDto, AdminListingSortOption } from '../dto/admin-listing-query.dto';
import { AdminListingListResponseDto, AdminListingSummaryDto } from '../dto/admin-listing-summary.dto';
import { BulkModerateListingsDto, BulkModerationAction, BulkModerationResultDto } from '../dto/bulk-moderate.dto';
import { AdminListingDetailDto as ListingDetailDto } from '../dto/admin-listing-detail.dto';
import { RejectListingDto } from '../../listings/dto/moderate-listing.dto';

@Injectable()
export class AdminListingsService {
  constructor(private readonly prisma: PrismaService, private readonly listingsService: ListingsService) {}

  async list(query: AdminListingQueryDto): Promise<AdminListingListResponseDto> {
    const { limit = 20, offset = 0 } = query;
    const where: Prisma.ListingWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.dealerId) {
      where.dealerId = query.dealerId;
    }
    if (query.cityId) {
      where.cityId = query.cityId;
    }
    if (query.q) {
      where.OR = [
        { id: query.q },
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.ListingOrderByWithRelationInput[] =
      query.sort === AdminListingSortOption.CREATED_DESC
        ? [{ createdAt: 'desc' }]
        : [{ updatedAt: 'desc' }];

    const [total, listings] = await Promise.all([
      this.prisma.listing.count({ where }),
      this.prisma.listing.findMany({
        where,
        include: { dealer: true, city: true },
        orderBy,
        take: limit,
        skip: offset,
      }),
    ]);

    const items: AdminListingSummaryDto[] = listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      status: listing.status,
      dealerId: listing.dealerId,
      dealerName: listing.dealer?.name ?? null,
      cityId: listing.cityId,
      cityName: listing.city?.name ?? null,
      categoryId: listing.categoryId,
      priceKzt: listing.priceKzt?.toString() ?? null,
      boostScore: listing.boostScore,
      updatedAt: listing.updatedAt,
      createdAt: listing.createdAt,
    }));

    return {
      items,
      total,
      limit,
      offset,
    };
  }

  async findById(id: string): Promise<ListingDetailDto> {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        media: true,
        dealer: true,
        city: true,
        region: true,
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    const specs = (listing.specs as Record<string, any> | null) ?? null;
    const moderationReason = specs?.moderationReason ?? null;

    return {
      id: listing.id,
      status: listing.status,
      sellerType: listing.sellerType as SellerType,
      title: listing.title,
      description: listing.description,
      categoryId: listing.categoryId,
      priceKzt: listing.priceKzt?.toString() ?? null,
      priceCurrency: listing.priceCurrency,
      params: (listing.params as Record<string, any> | null) ?? null,
      specs,
      contactMasked: listing.contactMasked ?? null,
      media: listing.media.map((item) => ({
        id: item.id,
        kind: item.kind,
        url: item.url,
        previewUrl: item.previewUrl ?? null,
      })),
      dealer: {
        id: listing.dealerId ?? null,
        name: listing.dealer?.name ?? null,
      },
      userId: listing.userId,
      region: {
        id: listing.regionId ?? null,
        name: listing.region?.name ?? null,
      },
      city: {
        id: listing.cityId ?? null,
        name: listing.city?.name ?? null,
      },
      meta: {
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
        publishedAt: listing.publishedAt ?? null,
        expiresAt: listing.expiresAt ?? null,
        moderationReason,
        boostScore: listing.boostScore,
      },
    };
  }

  async publish(id: string, user: AuthenticatedUser) {
    return this.listingsService.publish(id, user);
  }

  async reject(id: string, user: AuthenticatedUser, reason?: string) {
    const dto: RejectListingDto = { reason: reason ?? null };
    return this.listingsService.reject(id, user, dto);
  }

  async bulkModerate(dto: BulkModerateListingsDto, user: AuthenticatedUser): Promise<BulkModerationResultDto> {
    const succeeded: string[] = [];
    const failed: string[] = [];

    for (const id of dto.ids) {
      try {
        if (dto.action === BulkModerationAction.PUBLISH) {
          await this.publish(id, user);
        } else if (dto.action === BulkModerationAction.REJECT) {
          await this.reject(id, user, dto.reason);
        }
        succeeded.push(id);
      } catch (error) {
        failed.push(id);
      }
    }

    return { succeeded, failed };
  }
}
