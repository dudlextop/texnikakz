import type { ListingSummary } from './listings';
import type { SpecialistSummary } from './specialists';

export interface UserProfile {
  id: string;
  role: 'user' | 'dealer' | 'moderator' | 'admin';
  phone: string;
  dealerId?: string | null;
  name?: string | null;
  dealerName?: string | null;
}

export interface DashboardOverview {
  listings: ListingSummary[];
  specialists: SpecialistSummary[];
  stats: {
    activeListings: number;
    pendingListings: number;
    promotions: number;
  };
}
