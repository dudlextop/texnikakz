export type SpecialistAvailability = 'permanent' | 'temporary' | 'shift' | 'relocation';

export interface SpecialistSummary {
  id: string;
  name: string;
  profession: string;
  cityName?: string | null;
  regionName?: string | null;
  experienceYears: number;
  rateHour?: number | null;
  rateShift?: number | null;
  rateMonth?: number | null;
  hasEquipment: boolean;
  rating?: number | null;
  reviewsCount?: number;
  promotionTypes?: ('vip' | 'top' | 'highlight')[];
  avatarUrl?: string | null;
}

export interface SpecialistFilters {
  q?: string;
  cityId?: string;
  profession?: string;
  availability?: SpecialistAvailability;
  minExperience?: number;
  rateFrom?: number;
  rateTo?: number;
  withEquipment?: boolean;
  sort?: 'rating' | 'experience' | 'price' | 'reviews';
  limit?: number;
  offset?: number;
}

export interface SpecialistsApiResponse {
  items: SpecialistSummary[];
  total: number;
  limit: number;
  offset: number;
}

export interface SpecialistDetail extends SpecialistSummary {
  bio?: string;
  description?: string;
  availability?: SpecialistAvailability;
  certifications?: { title: string; url?: string | null }[];
  portfolio?: { url: string; previewUrl?: string | null }[];
  contactMasked?: string | null;
}
