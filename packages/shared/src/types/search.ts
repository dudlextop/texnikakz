export interface ListingSearchHit {
  id: string;
  title: string;
  slug: string;
  priceKzt?: string | null;
  priceCurrency: string;
  categoryId: string;
  cityId?: string | null;
  regionId?: string | null;
  dealerId?: string | null;
  sellerType: string;
  boostScore: number;
  publishedAt?: string | null;
  badges: string[];
}

export interface SearchFacetBucket {
  id: string;
  count: number;
}

export interface ListingsSearchResponse {
  items: ListingSearchHit[];
  total: number;
  limit: number;
  offset: number;
  facets: {
    categories: SearchFacetBucket[];
  };
}
