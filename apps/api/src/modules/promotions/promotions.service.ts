import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Listing, Promotion, PromotionType, UserRole, Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { PrismaService } from '../database/prisma.service';
import { SearchSyncService } from '../search/search-sync.service';
import { ApplyPromotionDto } from './dto/apply-promotion.dto';
import { ApplyPromotionResultDto } from './dto/apply-promotion.result';
import { PromotionDto } from './dto/promotion.dto';

const PROMOTION_BOOST: Record<PromotionType, number> = {
  VIP: 2.0,
  TOP: 1.5,
  HIGHLIGHT: 0.3,
  AUTOBUMP: 0
};

@Injectable()
export class PromotionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly searchSyncService: SearchSyncService
  ) {}

  async applyPromotion(
    listingId: string,
    dto: ApplyPromotionDto,
    user: AuthenticatedUser
  ): Promise<ApplyPromotionResultDto> {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    this.ensureCanPromote(listing, user);

    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + dto.days * 24 * 60 * 60 * 1000);
    const promotion = await this.prisma.promotion.create({
      data: {
        listingId: listing.id,
        type: dto.type,
        startsAt,
        endsAt
      }
    });

    const activePromotions = await this.prisma.promotion.findMany({
      where: {
        listingId: listing.id,
        endsAt: {
          gt: new Date()
        }
      }
    });

    const boostScore = activePromotions.reduce((max, promo) => {
      return Math.max(max, PROMOTION_BOOST[promo.type]);
    }, 0);

    const listingUpdate: Prisma.ListingUpdateInput = {
      boostScore
    };
    if (dto.type === PromotionType.AUTOBUMP) {
      listingUpdate.updatedAt = new Date();
    }

    await this.prisma.listing.update({
      where: { id: listing.id },
      data: listingUpdate
    });

    await this.searchSyncService.syncListingById(listing.id);

    return {
      promotion: this.toDto(promotion),
      boostScore
    };
  }

  private ensureCanPromote(listing: Listing, user: AuthenticatedUser) {
    if (user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR) {
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

  private toDto(promotion: Promotion): PromotionDto {
    return {
      id: promotion.id,
      listingId: promotion.listingId,
      type: promotion.type,
      startsAt: promotion.startsAt,
      endsAt: promotion.endsAt,
      meta: (promotion.meta as Record<string, any> | null) ?? null
    };
  }
}
