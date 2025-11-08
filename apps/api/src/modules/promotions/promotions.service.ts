import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  Listing,
  Prisma,
  PricingPlanCode,
  PromotionActivation,
  PromotionActivationStatus,
  PromotionSubjectType,
  PromotionType,
  UserRole
} from '@prisma/client';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { PrismaService } from '../database/prisma.service';
import { ApplyPromotionDto } from './dto/apply-promotion.dto';
import { ApplyPromotionResultDto } from './dto/apply-promotion.result';
import { PromotionDto } from './dto/promotion.dto';

const PROMOTION_BOOST: Record<PromotionType, number> = {
  VIP: 2.0,
  TOP: 1.5,
  HIGHLIGHT: 0.3,
  AUTOBUMP: 0
};

const PLAN_CODE_FROM_TYPE: Record<PromotionType, PricingPlanCode | null> = {
  VIP: PricingPlanCode.VIP,
  TOP: PricingPlanCode.TOP,
  HIGHLIGHT: PricingPlanCode.HIGHLIGHT,
  AUTOBUMP: null
};

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

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
    let boostScore = 0;
    let activation: PromotionActivation | null = null;

    if (dto.type === PromotionType.AUTOBUMP) {
      boostScore = await this.resolveBoostScore(listing.id);
      await this.prisma.listing.update({
        where: { id: listing.id },
        data: { updatedAt: new Date() }
      });
    } else {
      const planCode = PLAN_CODE_FROM_TYPE[dto.type];
      if (!planCode) {
        throw new NotFoundException('Unsupported promotion type');
      }

      activation = await this.prisma.promotionActivation.create({
        data: {
          subjectType: PromotionSubjectType.LISTING,
          subjectId: listing.id,
          planCode,
          startedAt: startsAt,
          expiresAt: endsAt,
          status: PromotionActivationStatus.ACTIVE
        }
      });

      boostScore = await this.resolveBoostScore(listing.id);
    }

    const listingUpdate: Prisma.ListingUpdateInput = {
      boostScore
    };

    await this.prisma.listing.update({
      where: { id: listing.id },
      data: listingUpdate
    });

    return {
      promotion: activation ? this.toDto(activation) : null,
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

  private async resolveBoostScore(listingId: string): Promise<number> {
    const activations = await this.prisma.promotionActivation.findMany({
      where: {
        subjectType: PromotionSubjectType.LISTING,
        subjectId: listingId,
        status: PromotionActivationStatus.ACTIVE,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    return activations.reduce((max, activation) => {
      const type = this.resolvePromotionType(activation.planCode);
      return Math.max(max, PROMOTION_BOOST[type]);
    }, 0);
  }

  private resolvePromotionType(planCode: PricingPlanCode): PromotionType {
    switch (planCode) {
      case PricingPlanCode.VIP:
        return PromotionType.VIP;
      case PricingPlanCode.TOP:
        return PromotionType.TOP;
      case PricingPlanCode.HIGHLIGHT:
      default:
        return PromotionType.HIGHLIGHT;
    }
  }

  private toDto(promotion: PromotionActivation): PromotionDto {
    return {
      id: promotion.id,
      listingId: promotion.subjectId,
      type: this.resolvePromotionType(promotion.planCode),
      startsAt: promotion.startedAt,
      endsAt: promotion.expiresAt,
      meta: null
    };
  }
}
