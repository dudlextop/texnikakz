import { Injectable } from '@nestjs/common';
import { ListingsSearchResponse } from '@texnika/shared';
import { ListingDto } from '../listings/dto/listing.dto';
import { ListingQueryDto } from '../listings/dto/listing-query.dto';
import { ListingsService } from '../listings/listings.service';

@Injectable()
export class SearchService {
  constructor(private readonly listingsService: ListingsService) {}

  async searchListings(query: ListingQueryDto): Promise<ListingsSearchResponse> {
    const result = await this.listingsService.list(query);
    return {
      items: result.items.map((item) => this.mapListing(item)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
      facets: {
        categories: result.categoryFacets.map((facet) => ({ id: facet.categoryId, count: facet.count }))
      }
    };
  }

  private mapListing(item: ListingDto): ListingsSearchResponse['items'][number] {
    return {
      id: item.id,
      title: item.title,
      slug: item.slug,
      priceKzt: item.priceKzt ?? null,
      priceCurrency: item.priceCurrency,
      categoryId: item.categoryId,
      cityId: item.cityId ?? null,
      regionId: item.regionId ?? null,
      dealerId: item.dealerId ?? undefined,
      sellerType: item.sellerType,
      boostScore: item.boostScore,
      publishedAt: item.publishedAt?.toISOString() ?? null,
      badges: this.resolveBadges(item)
    };
  }

  private resolveBadges(item: ListingDto): string[] {
    const badges: string[] = [];
    if (item.boostScore >= 2) {
      badges.push('VIP');
    } else if (item.boostScore >= 1.5) {
      badges.push('TOP');
    } else if (item.boostScore >= 0.3) {
      badges.push('HIGHLIGHT');
    }
    return badges;
  }
}
