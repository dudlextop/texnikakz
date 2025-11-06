import type { ListingSearchHit } from '@texnikakz/shared/types/search';
import type { UploadedMediaItem } from './media';

export type PromotionType = 'vip' | 'top' | 'highlight';

export interface ListingSummary extends ListingSearchHit {
  cityName?: string | null;
  regionName?: string | null;
  thumbnailUrl?: string | null;
  year?: number | null;
  createdAt?: string;
  promotionTypes?: PromotionType[];
  hasMedia?: boolean;
}

export interface ListingFacetOption {
  id: string;
  label: string;
  count: number;
}

export interface ListingFilters {
  q?: string;
  categoryId?: string;
  cityId?: string;
  priceFrom?: number;
  priceTo?: number;
  yearFrom?: number;
  yearTo?: number;
  dealerId?: string;
  hasMedia?: boolean;
  status?: string;
  sort?: 'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'year_desc';
  limit?: number;
  offset?: number;
}

export interface ListingsApiResponse {
  items: ListingSummary[];
  total: number;
  limit: number;
  offset: number;
  facets: {
    categories: ListingFacetOption[];
    sellerTypes?: ListingFacetOption[];
  };
}

export interface ListingDetail extends ListingSummary {
  description?: string;
  parameters?: Record<string, string | number | boolean | null>;
  media: UploadedMediaItem[];
  contactMasked?: string | null;
  dealer?: {
    id: string;
    name: string;
    phone?: string | null;
    website?: string | null;
  } | null;
  recommendations?: ListingSummary[];
}
