import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, errors } from '@opensearch-project/opensearch';
import { ListingStatus, MediaKind } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { LISTINGS_INDEX_DEFINITION } from './listings-index.definition';
import { LISTINGS_INDEX_NAME, OPENSEARCH_CLIENT } from './constants';
import { ListingDocument } from './interfaces/listing-document.interface';

@Injectable()
export class SearchSyncService {
  private readonly logger = new Logger(SearchSyncService.name);
  private indexEnsured = false;
  private readonly lifecyclePolicyName = 'listings_policy';

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(OPENSEARCH_CLIENT) private readonly client: Client
  ) {}

  async syncListingById(listingId: string): Promise<void> {
    await this.ensureIndex();
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        media: true,
        category: true,
        city: true,
        region: true,
        dealer: true
      }
    });

    if (!listing || listing.status !== ListingStatus.PUBLISHED) {
      await this.removeListing(listingId);
      return;
    }

    const document = this.toDocument(listing);
    await this.client.index({
      index: LISTINGS_INDEX_NAME,
      id: listing.id,
      body: document,
      refresh: 'wait_for'
    });
  }

  async removeListing(listingId: string): Promise<void> {
    await this.ensureIndex();
    try {
      await this.client.delete({
        index: LISTINGS_INDEX_NAME,
        id: listingId,
        refresh: 'wait_for'
      });
    } catch (error) {
      if (error instanceof errors.ResponseError && error.meta.statusCode === 404) {
        return;
      }
      this.logger.warn(`Failed to remove listing ${listingId} from index`, error as Error);
    }
  }

  async reindexAll(): Promise<number> {
    await this.deleteIndexIfExists();
    this.indexEnsured = false;
    await this.ensureIndex();

    const pageSize = this.configService.get<number>('SEARCH_REINDEX_BATCH_SIZE', 200);
    let offset = 0;
    let totalIndexed = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const listings = await this.prisma.listing.findMany({
        where: { status: ListingStatus.PUBLISHED },
        include: {
          media: true,
          category: true,
          city: true,
          region: true,
          dealer: true
        },
        orderBy: { createdAt: 'asc' },
        skip: offset,
        take: pageSize
      });

      if (!listings.length) {
        break;
      }

      const body = listings.flatMap((listing) => [
        { index: { _index: LISTINGS_INDEX_NAME, _id: listing.id } },
        this.toDocument(listing)
      ]);

      await this.client.bulk({ refresh: true, body });

      offset += listings.length;
      totalIndexed += listings.length;
    }

    return totalIndexed;
  }

  private async ensureIndex(): Promise<void> {
    if (this.indexEnsured) {
      return;
    }

    await this.ensureLifecyclePolicy();
    const exists = await this.client.indices.exists({ index: LISTINGS_INDEX_NAME });
    const alreadyExists = typeof exists === 'boolean' ? exists : (exists as any).body;

    if (!alreadyExists) {
      const body = {
        ...LISTINGS_INDEX_DEFINITION,
        settings: {
          ...(LISTINGS_INDEX_DEFINITION.settings ?? {}),
          index: {
            ...(LISTINGS_INDEX_DEFINITION.settings?.index ?? {}),
            lifecycle: {
              name: this.lifecyclePolicyName
            }
          }
        }
      };
      await this.client.indices.create(body);
    }

    this.indexEnsured = true;
  }

  private async ensureLifecyclePolicy(): Promise<void> {
    try {
      await this.client.transport.request({
        method: 'PUT',
        path: `/_ilm/policy/${this.lifecyclePolicyName}`,
        body: {
          policy: {
            phases: {
              hot: {
                actions: {
                  rollover: {
                    max_age: '90d',
                    max_size: '50gb'
                  }
                }
              },
              warm: {
                min_age: '90d',
                actions: {
                  forcemerge: {
                    max_num_segments: 1
                  }
                }
              },
              delete: {
                min_age: '365d',
                actions: {
                  delete: {}
                }
              }
            }
          }
        }
      });
    } catch (error) {
      if (error instanceof errors.ResponseError && error.meta.statusCode === 409) {
        return;
      }
      this.logger.warn('Failed to ensure lifecycle policy for listings index', error as Error);
    }
  }

  private async deleteIndexIfExists(): Promise<void> {
    try {
      await this.client.indices.delete({ index: LISTINGS_INDEX_NAME });
    } catch (error) {
      if (error instanceof errors.ResponseError && error.meta.statusCode === 404) {
        return;
      }
      this.logger.warn('Failed to delete listings index prior to reindex', error as Error);
    }
  }

  private toDocument(listing: any): ListingDocument {
    const price = listing.priceKzt ? Number(listing.priceKzt) : null;
    const mediaItems = Array.isArray(listing.media) ? listing.media : [];
    const hasMedia = mediaItems.some((media: any) => media.kind === MediaKind.IMAGE || media.kind === MediaKind.VIDEO);
    const now = Date.now();
    const ageHours = (now - listing.createdAt.getTime()) / 3_600_000;
    const freshnessHalfLife = 72; // hours
    const freshnessScore = Math.exp(-ageHours / freshnessHalfLife);

    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      slug: listing.slug,
      categoryId: listing.categoryId,
      categorySlug: listing.category?.name ?? listing.categoryId,
      cityId: listing.cityId ?? undefined,
      citySlug: listing.city?.slug ?? undefined,
      regionId: listing.regionId ?? undefined,
      dealerId: listing.dealerId ?? undefined,
      dealerPlan: listing.dealer?.plan ?? undefined,
      dealType: listing.dealType,
      sellerType: listing.sellerType,
      status: listing.status,
      year: this.extractNumeric(listing.specs, 'year'),
      price: price ?? undefined,
      priceCurrency: listing.priceCurrency,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
      expiresAt: listing.expiresAt?.toISOString() ?? null,
      publishedAt: listing.publishedAt?.toISOString() ?? null,
      mediaCount: mediaItems.length,
      hasMedia,
      isVIP: listing.boostScore >= 2,
      isTOP: listing.boostScore >= 1.5,
      isHighlight: listing.boostScore >= 0.3,
      boostScore: listing.boostScore,
      freshnessScore,
      geo:
        listing.latitude !== null && listing.latitude !== undefined && listing.longitude !== null && listing.longitude !== undefined
          ? { lat: listing.latitude, lon: listing.longitude }
          : undefined,
      attributes: this.buildAttributes(listing)
    };
  }

  private extractNumeric(source: Record<string, any> | null, key: string): number | undefined {
    if (!source) {
      return undefined;
    }
    const value = source[key];
    if (value === null || value === undefined) {
      return undefined;
    }
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : undefined;
  }

  private buildAttributes(listing: any): ListingDocument['attributes'] {
    const attributes: ListingDocument['attributes'] = [];
    const pushEntries = (source: Record<string, any> | null | undefined) => {
      if (!source) {
        return;
      }
      Object.entries(source).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          return;
        }
        if (typeof value === 'object' && !Array.isArray(value)) {
          pushEntries(value as Record<string, any>);
          return;
        }
        const numericCandidate = typeof value === 'number' ? value : Number(value);
        const numeric = Number.isFinite(numericCandidate) ? numericCandidate : undefined;
        attributes.push({
          key,
          value: Array.isArray(value) ? value.join(',') : String(value),
          numeric: numeric ?? undefined
        });
      });
    };

    pushEntries(listing.params as Record<string, any> | null);
    pushEntries(listing.specs as Record<string, any> | null);

    return attributes;
  }
}
