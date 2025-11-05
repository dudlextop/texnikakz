export interface ListingDocument {
  id: string;
  title: string;
  description: string;
  slug: string;
  categoryId: string;
  categorySlug: string;
  cityId?: string;
  citySlug?: string;
  regionId?: string;
  dealerId?: string;
  dealerPlan?: string;
  dealType: string;
  sellerType: string;
  status: string;
  year?: number | null;
  price?: number;
  priceCurrency: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
  publishedAt?: string | null;
  mediaCount: number;
  hasMedia: boolean;
  isVIP: boolean;
  isTOP: boolean;
  isHighlight: boolean;
  boostScore: number;
  freshnessScore: number;
  geo?: { lat: number; lon: number };
  attributes: Array<{
    key: string;
    value: string;
    numeric?: number | null;
  }>;
}
