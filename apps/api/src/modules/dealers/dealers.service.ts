import { Injectable, NotFoundException } from '@nestjs/common';
import { Dealer, DealerPlan, ListingStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateDealerDto } from './dto/create-dealer.dto';
import { DealerDto } from './dto/dealer.dto';
import { DealerStatsDto } from './dto/dealer-stats.dto';
import { UpdateDealerDto } from './dto/update-dealer.dto';

@Injectable()
export class DealersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDealerDto): Promise<DealerDto> {
    const dealer = await this.prisma.dealer.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        innIin: dto.innIin,
        description: dto.description,
        website: dto.website,
        addresses: dto.addresses ?? null,
        plan: dto.plan ?? DealerPlan.FREE,
        logoKey: dto.logoKey
      }
    });
    return this.toDto(dealer);
  }

  async update(identifier: string, dto: UpdateDealerDto): Promise<DealerDto> {
    const dealer = await this.resolveDealer(identifier);
    const updated = await this.prisma.dealer.update({
      where: { id: dealer.id },
      data: {
        ...dto,
        addresses: dto.addresses ?? dealer.addresses
      }
    });
    return this.toDto(updated);
  }

  async remove(identifier: string): Promise<void> {
    const dealer = await this.resolveDealer(identifier);
    await this.prisma.dealer.delete({ where: { id: dealer.id } });
  }

  async findPublic(identifier: string): Promise<DealerDto> {
    const dealer = await this.resolveDealer(identifier);
    return this.toDto(dealer);
  }

  async stats(identifier: string): Promise<DealerStatsDto> {
    const dealer = await this.resolveDealer(identifier);
    const [listingsTotal, listingsPublished, ordersTotal, membersTotal] = await Promise.all([
      this.prisma.listing.count({ where: { dealerId: dealer.id } }),
      this.prisma.listing.count({ where: { dealerId: dealer.id, status: ListingStatus.PUBLISHED } }),
      this.prisma.order.count({ where: { dealerId: dealer.id } }),
      this.prisma.user.count({ where: { dealerId: dealer.id } })
    ]);
    return {
      dealerId: dealer.id,
      listingsTotal,
      listingsPublished,
      ordersTotal,
      membersTotal
    };
  }

  private async resolveDealer(identifier: string): Promise<Dealer> {
    const byId = await this.prisma.dealer.findUnique({ where: { id: identifier } });
    if (byId) {
      return byId;
    }
    const bySlug = await this.prisma.dealer.findUnique({ where: { slug: identifier } });
    if (bySlug) {
      return bySlug;
    }
    throw new NotFoundException('Dealer not found');
  }

  private toDto(dealer: Dealer): DealerDto {
    return {
      id: dealer.id,
      name: dealer.name,
      slug: dealer.slug,
      innIin: dealer.innIin,
      description: dealer.description,
      website: dealer.website,
      addresses: (dealer.addresses as Record<string, any> | null) ?? null,
      plan: dealer.plan,
      logoKey: dealer.logoKey,
      createdAt: dealer.createdAt,
      updatedAt: dealer.updatedAt
    };
  }
}
