import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import {
  DealType,
  Listing,
  ListingStatus,
  Media,
  Prisma,
  SellerType,
  UserRole
} from '@prisma/client';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { slugify } from '../common/utils/slug.util';
import { PrismaService } from '../database/prisma.service';
import { SearchSyncService } from '../search/search-sync.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { ListingDto } from './dto/listing.dto';
import { ListingListResponseDto } from './dto/listing-list-response.dto';
import { ListingQueryDto, ListingSortOption } from './dto/listing-query.dto';
import { RejectListingDto } from './dto/moderate-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

@Injectable()
export class ListingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly searchSyncService: SearchSyncService
  ) {}

  async create(dto: CreateListingDto, user: AuthenticatedUser): Promise<ListingDto> {
    const dealerId = await this.resolveDealerForCreation(dto.dealerId, user);
    const slug = await this.generateUniqueSlug(dto.title);
    const listing = await this.prisma.listing.create({
      data: {
        status: ListingStatus.DRAFT,
        dealType: dto.dealType ?? DealType.SALE,
        categoryId: dto.categoryId,
        title: dto.title,
        slug,
        description: dto.description,
        priceKzt: dto.priceKzt !== undefined ? new Prisma.Decimal(dto.priceKzt) : null,
        priceCurrency: dto.priceCurrency ?? 'KZT',
        regionId: dto.regionId,
        cityId: dto.cityId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        sellerType: dealerId ? SellerType.DEALER : dto.sellerType ?? SellerType.PRIVATE,
        userId: user.id,
        dealerId,
        params: dto.params ?? null,
        specs: dto.specs ?? null,
        contactMasked: dto.contactMasked ?? null
      },
      include: { media: true }
    });
    const dto = this.toDto(listing);
    await this.searchSyncService.syncListingById(dto.id);
    return dto;
  }

  async update(id: string, dto: UpdateListingDto, user: AuthenticatedUser): Promise<ListingDto> {
    const listing = await this.findListingOrThrow(id);
    this.ensureCanMutate(listing, user);
    const slug = dto.title ? await this.generateUniqueSlug(dto.title, listing.id) : listing.slug;
    const dealerId = await this.resolveDealerForUpdate(listing, dto.dealerId, user);
    const updated = await this.prisma.listing.update({
      where: { id: listing.id },
      data: {
        title: dto.title ?? listing.title,
        slug,
        description: dto.description ?? listing.description,
        categoryId: dto.categoryId ?? listing.categoryId,
        dealType: dto.dealType ?? listing.dealType,
        sellerType: dealerId ? SellerType.DEALER : dto.sellerType ?? listing.sellerType,
        priceKzt: dto.priceKzt !== undefined ? new Prisma.Decimal(dto.priceKzt) : listing.priceKzt,
        priceCurrency: dto.priceCurrency ?? listing.priceCurrency,
        regionId: dto.regionId ?? listing.regionId,
        cityId: dto.cityId ?? listing.cityId,
        latitude: dto.latitude ?? listing.latitude,
        longitude: dto.longitude ?? listing.longitude,
        params: dto.params ?? listing.params,
        specs: dto.specs ?? listing.specs,
        contactMasked: dto.contactMasked ?? listing.contactMasked,
        dealerId
      },
      include: { media: true }
    });
    const dto = this.toDto(updated);
    await this.searchSyncService.syncListingById(dto.id);
    return dto;
  }

  async remove(id: string, user: AuthenticatedUser): Promise<void> {
    const listing = await this.findListingOrThrow(id);
    this.ensureCanMutate(listing, user);
    await this.prisma.listing.delete({ where: { id: listing.id } });
    await this.searchSyncService.removeListing(listing.id);
  }

  async submit(id: string, user: AuthenticatedUser): Promise<ListingDto> {
    const listing = await this.findListingOrThrow(id);
    this.ensureCanMutate(listing, user);
    const updated = await this.prisma.listing.update({
      where: { id: listing.id },
      data: {
        status: ListingStatus.PENDING,
        updatedAt: new Date()
      },
      include: { media: true }
    });
    const dto = this.toDto(updated);
    await this.searchSyncService.syncListingById(dto.id);
    return dto;
  }

  async publish(id: string, user: AuthenticatedUser): Promise<ListingDto> {
    this.ensureModerator(user);
    const listing = await this.findListingOrThrow(id);
    const updated = await this.prisma.listing.update({
      where: { id: listing.id },
      data: {
        status: ListingStatus.PUBLISHED,
        publishedAt: new Date()
      },
      include: { media: true }
    });
    const dto = this.toDto(updated);
    await this.searchSyncService.syncListingById(dto.id);
    return dto;
  }

  async reject(id: string, user: AuthenticatedUser, dto: RejectListingDto): Promise<ListingDto> {
    this.ensureModerator(user);
    const listing = await this.findListingOrThrow(id);
    const specs = {
      ...(listing.specs as Record<string, any> | null),
      moderationReason: dto.reason ?? null
    };
    const updated = await this.prisma.listing.update({
      where: { id: listing.id },
      data: {
        status: ListingStatus.REJECTED,
        specs,
        boostScore: 0
      },
      include: { media: true }
    });
    const dto = this.toDto(updated);
    await this.searchSyncService.removeListing(dto.id);
    return dto;
  }

  async findPublic(id: string): Promise<ListingDto> {
    const listing = await this.findListingOrThrow(id, true);
    return this.toDto(listing);
  }

  async list(query: ListingQueryDto): Promise<ListingListResponseDto> {
    const { limit = 20, offset = 0 } = query;
    const where = this.buildPublicWhere(query);
    const orderBy = this.buildOrderBy(query.sort ?? ListingSortOption.NEWEST);

    const [total, items, facets] = await Promise.all([
      this.prisma.listing.count({ where }),
      this.prisma.listing.findMany({
        where,
        include: { media: true },
        take: limit,
        skip: offset,
        orderBy
      }),
      this.prisma.listing.groupBy({
        by: ['categoryId'],
        where,
        _count: { _all: true }
      })
    ]);

    return {
      items: items.map((item) => this.toDto(item)),
      total,
      limit,
      offset,
      categoryFacets: facets.map((facet) => ({
        categoryId: facet.categoryId,
        count: facet._count._all
      }))
    };
  }

  async findManyByIds(ids: string[]): Promise<ListingDto[]> {
    if (!ids.length) {
      return [];
    }
    const listings = await this.prisma.listing.findMany({
      where: { id: { in: ids } },
      include: { media: true }
    });
    const map = new Map(listings.map((listing) => [listing.id, this.toDto(listing)]));
    return ids.map((id) => map.get(id)).filter((item): item is ListingDto => Boolean(item));
  }

  private buildPublicWhere(query: ListingQueryDto): Prisma.ListingWhereInput {
    const and: Prisma.ListingWhereInput[] = [];
    if (query.yearFrom !== undefined) {
      and.push({ specs: { path: ['year'], gte: query.yearFrom } as any });
    }
    if (query.yearTo !== undefined) {
      and.push({ specs: { path: ['year'], lte: query.yearTo } as any });
    }

    const where: Prisma.ListingWhereInput = {
      status: ListingStatus.PUBLISHED,
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { description: { contains: query.q, mode: 'insensitive' } }
            ]
          }
        : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.cityId ? { cityId: query.cityId } : {}),
      ...(query.regionId ? { regionId: query.regionId } : {}),
      ...(query.dealerId ? { dealerId: query.dealerId } : {}),
      ...(query.priceFrom !== undefined
        ? { priceKzt: { gte: new Prisma.Decimal(query.priceFrom) } }
        : {}),
      ...(query.priceTo !== undefined
        ? { priceKzt: { lte: new Prisma.Decimal(query.priceTo) } }
        : {}),
      ...(query.hasMedia ? { media: { some: {} } } : {}),
      ...(and.length ? { AND: and } : {})
    };

    return where;
  }

  private buildOrderBy(sort: ListingSortOption): Prisma.ListingOrderByWithRelationInput[] {
    switch (sort) {
      case ListingSortOption.PRICE_ASC:
        return [{ priceKzt: 'asc' }, { createdAt: 'desc' }];
      case ListingSortOption.PRICE_DESC:
        return [{ priceKzt: 'desc' }, { createdAt: 'desc' }];
      case ListingSortOption.YEAR_DESC:
        return [{ specs: { path: ['year'], sort: 'desc' } as any }, { createdAt: 'desc' }];
      case ListingSortOption.RELEVANCE:
        return [{ boostScore: 'desc' }, { createdAt: 'desc' }];
      case ListingSortOption.NEWEST:
      default:
        return [{ createdAt: 'desc' }];
    }
  }

  private async resolveDealerForCreation(providedDealerId: string | undefined, user: AuthenticatedUser) {
    if (providedDealerId) {
      if (user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR) {
        return providedDealerId;
      }
      if (user.dealerId && user.dealerId === providedDealerId) {
        return providedDealerId;
      }
      throw new ForbiddenException('Cannot create listing for another dealer');
    }
    if (user.dealerId) {
      return user.dealerId;
    }
    return undefined;
  }

  private ensureCanMutate(listing: Listing, user: AuthenticatedUser) {
    if (user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR) {
      return;
    }
    if (listing.userId === user.id) {
      return;
    }
    if (listing.dealerId && user.dealerId && listing.dealerId === user.dealerId) {
      return;
    }
    throw new ForbiddenException('Not allowed to modify this listing');
  }

  private ensureModerator(user: AuthenticatedUser) {
    if (user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR) {
      return;
    }
    throw new ForbiddenException('Moderator access required');
  }

  private async resolveDealerForUpdate(listing: Listing, newDealerId: string | undefined, user: AuthenticatedUser) {
    if (newDealerId === undefined) {
      return listing.dealerId ?? undefined;
    }
    if (newDealerId === listing.dealerId) {
      return listing.dealerId ?? undefined;
    }
    if (user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR) {
      return newDealerId;
    }
    throw new ForbiddenException('Cannot reassign dealer for this listing');
  }

  private async findListingOrThrow(idOrSlug: string, onlyPublished = false) {
    const where: Prisma.ListingWhereUniqueInput = { id: idOrSlug };
    let listing = await this.prisma.listing.findUnique({ where, include: { media: true } });
    if (!listing) {
      listing = await this.prisma.listing.findUnique({ where: { slug: idOrSlug }, include: { media: true } });
    }
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    if (onlyPublished && listing.status !== ListingStatus.PUBLISHED) {
      throw new NotFoundException('Listing not published');
    }
    return listing;
  }

  private async generateUniqueSlug(title: string, listingIdToExclude?: string) {
    const base = slugify(title) || `listing-${Date.now()}`;
    let slug = base;
    let counter = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await this.prisma.listing.findUnique({ where: { slug } });
      if (!existing || existing.id === listingIdToExclude) {
        break;
      }
      slug = `${base}-${counter++}`;
    }
    return slug;
  }

  private toDto(listing: Listing & { media: Media[] }): ListingDto {
    const media = Array.isArray(listing.media)
      ? listing.media.map((item) => ({
          id: item.id,
          kind: item.kind,
          url: item.url,
          previewUrl: item.previewUrl ?? null
        }))
      : [];
    return {
      id: listing.id,
      status: listing.status,
      dealType: listing.dealType,
      categoryId: listing.categoryId,
      title: listing.title,
      slug: listing.slug,
      description: listing.description,
      priceKzt: listing.priceKzt?.toString() ?? null,
      priceCurrency: listing.priceCurrency,
      regionId: listing.regionId,
      cityId: listing.cityId,
      latitude: listing.latitude,
      longitude: listing.longitude,
      sellerType: listing.sellerType,
      userId: listing.userId,
      dealerId: listing.dealerId,
      params: (listing.params as Record<string, any> | null) ?? null,
      specs: (listing.specs as Record<string, any> | null) ?? null,
      contactMasked: listing.contactMasked,
      expiresAt: listing.expiresAt,
      publishedAt: listing.publishedAt,
      boostScore: listing.boostScore,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      media
    };
  }
}
