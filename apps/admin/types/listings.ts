export interface AdminListingSummary {
  id: string;
  title: string;
  status: string;
  dealerId: string | null;
  dealerName: string | null;
  cityId: string | null;
  cityName: string | null;
  categoryId: string | null;
  priceKzt: string | null;
  boostScore: number;
  updatedAt: string;
  createdAt: string;
}

export interface AdminListingListResponse {
  items: AdminListingSummary[];
  total: number;
  limit: number;
  offset: number;
}

export interface AdminListingDetail {
  id: string;
  status: string;
  sellerType: string;
  title: string;
  description: string;
  categoryId: string | null;
  priceKzt: string | null;
  priceCurrency: string | null;
  params: Record<string, any> | null;
  specs: Record<string, any> | null;
  contactMasked: string | null;
  media: Array<{ id: string; kind: string; url: string; previewUrl: string | null }>;
  dealer: { id: string | null; name: string | null };
  userId: string;
  region: { id: string | null; name: string | null };
  city: { id: string | null; name: string | null };
  meta: {
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
    expiresAt: string | null;
    moderationReason: string | null;
    boostScore: number;
  };
}
