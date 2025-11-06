export interface AdminStatsOverview {
  counts: {
    totalListings: number;
    pendingListings: number;
    publishedListings: number;
    dealers: number;
    specialists: number;
    paidOrders: number;
    activePromotions: number;
  };
  activity: Array<{
    date: string;
    publishedListings: number;
    pendingListings: number;
    specialists: number;
  }>;
}
