import { Inject, Injectable } from '@nestjs/common';
import { Client, estypes } from '@opensearch-project/opensearch';
import { ListingsSearchResponse } from '@texnika/shared';
import { ListingQueryDto, ListingSortOption } from '../listings/dto/listing-query.dto';
import { LISTINGS_INDEX_NAME, OPENSEARCH_CLIENT } from './constants';
import { ListingDocument } from './interfaces/listing-document.interface';

@Injectable()
export class SearchService {
  constructor(
    @Inject(OPENSEARCH_CLIENT)
    private readonly client: Client
  ) {}

  async searchListings(query: ListingQueryDto): Promise<ListingsSearchResponse> {
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;

    const existsResponse = await this.client.indices.exists({ index: LISTINGS_INDEX_NAME });
    const indexExists = typeof existsResponse === 'boolean' ? existsResponse : (existsResponse as any).body;

    if (!indexExists) {
      return {
        items: [],
        total: 0,
        limit,
        offset,
        facets: { categories: [] }
      };
    }

    const response = await this.client.search<ListingDocument>({
      index: LISTINGS_INDEX_NAME,
      from: offset,
      size: limit,
      body: {
        query: this.buildFunctionScoreQuery(query),
        sort: this.buildSort(query.sort),
        track_total_hits: true,
        aggs: {
          categories: {
            terms: {
              field: 'categoryId',
              size: 50
            }
          }
        }
      }
    });

    const total = typeof response.hits.total === 'number' ? response.hits.total : response.hits.total?.value ?? 0;
    const items = response.hits.hits
      .filter((hit) => !!hit._source)
      .map((hit) => this.mapListing(hit._source as ListingDocument));

    const categoryAgg = response.aggregations?.categories as
      | { buckets?: Array<{ key: string | number; doc_count?: number }> }
      | undefined;
    const categoryBuckets = categoryAgg?.buckets ?? [];

    return {
      items,
      total,
      limit,
      offset,
      facets: {
        categories: categoryBuckets.map((bucket) => ({
          id: String(bucket.key),
          count: bucket.doc_count ?? 0
        }))
      }
    };
  }

  private buildFunctionScoreQuery(query: ListingQueryDto): estypes.QueryDslFunctionScoreQuery {
    const boolQuery = this.buildBoolQuery(query);

    return {
      function_score: {
        query: boolQuery,
        score_mode: 'sum',
        boost_mode: 'sum',
        functions: [
          { filter: { term: { isVIP: true } }, weight: 4 },
          { filter: { term: { isTOP: true } }, weight: 2 },
          { filter: { term: { isHighlight: true } }, weight: 1.2 },
          { field_value_factor: { field: 'boostScore', factor: 1.5, missing: 0 } },
          { field_value_factor: { field: 'freshnessScore', factor: 2, missing: 0.1 } }
        ]
      }
    };
  }

  private buildBoolQuery(query: ListingQueryDto): estypes.QueryDslBoolQuery {
    const must: estypes.QueryDslQueryContainer[] = [];
    const filter: estypes.QueryDslQueryContainer[] = [{ term: { status: 'PUBLISHED' } }];

    if (query.q) {
      must.push({
        multi_match: {
          query: query.q,
          type: 'most_fields',
          fields: ['title^3', 'description']
        }
      });
    }

    if (query.categoryId) {
      filter.push({ term: { categoryId: query.categoryId } });
    }
    if (query.cityId) {
      filter.push({ term: { cityId: query.cityId } });
    }
    if (query.regionId) {
      filter.push({ term: { regionId: query.regionId } });
    }
    if (query.dealerId) {
      filter.push({ term: { dealerId: query.dealerId } });
    }
    if (query.hasMedia) {
      filter.push({ term: { hasMedia: true } });
    }
    if (query.priceFrom !== undefined || query.priceTo !== undefined) {
      filter.push({
        range: {
          price: {
            ...(query.priceFrom !== undefined ? { gte: query.priceFrom } : {}),
            ...(query.priceTo !== undefined ? { lte: query.priceTo } : {})
          }
        }
      });
    }
    if (query.yearFrom !== undefined || query.yearTo !== undefined) {
      filter.push({
        range: {
          year: {
            ...(query.yearFrom !== undefined ? { gte: query.yearFrom } : {}),
            ...(query.yearTo !== undefined ? { lte: query.yearTo } : {})
          }
        }
      });
    }

    return {
      must: must.length ? must : undefined,
      filter
    };
  }

  private buildSort(sortOption: ListingSortOption | undefined): estypes.SortCombinations[] {
    switch (sortOption) {
      case ListingSortOption.PRICE_ASC:
        return [
          { _score: { order: 'desc' } },
          { price: { order: 'asc', missing: '_last' } },
          { createdAt: { order: 'desc' } }
        ];
      case ListingSortOption.PRICE_DESC:
        return [
          { _score: { order: 'desc' } },
          { price: { order: 'desc', missing: '_last' } },
          { createdAt: { order: 'desc' } }
        ];
      case ListingSortOption.YEAR_DESC:
        return [
          { _score: { order: 'desc' } },
          { year: { order: 'desc', missing: '_last' } },
          { createdAt: { order: 'desc' } }
        ];
      case ListingSortOption.NEWEST:
        return [
          { createdAt: { order: 'desc' } },
          { _score: { order: 'desc' } }
        ];
      case ListingSortOption.RELEVANCE:
      default:
        return [
          { _score: { order: 'desc' } },
          { createdAt: { order: 'desc' } }
        ];
    }
  }

  private mapListing(doc: ListingDocument): ListingsSearchResponse['items'][number] {
    return {
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
      priceKzt: doc.price !== undefined ? doc.price.toString() : null,
      priceCurrency: doc.priceCurrency,
      categoryId: doc.categoryId,
      cityId: doc.cityId ?? null,
      regionId: doc.regionId ?? null,
      dealerId: doc.dealerId ?? undefined,
      sellerType: doc.sellerType,
      boostScore: doc.boostScore,
      publishedAt: doc.publishedAt ?? null,
      badges: this.resolveBadges(doc)
    };
  }

  private resolveBadges(doc: ListingDocument): string[] {
    const badges: string[] = [];
    if (doc.isVIP) {
      badges.push('VIP');
    } else if (doc.isTOP) {
      badges.push('TOP');
    } else if (doc.isHighlight) {
      badges.push('HIGHLIGHT');
    }
    return badges;
  }
}
