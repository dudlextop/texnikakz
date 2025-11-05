import type {
  DEAL_TYPES,
  LISTING_CATEGORIES,
  LISTING_STATUSES,
  PROMOTION_TYPES,
  SPECIALIST_ROLES
} from '../constants/domains';

type TupleToUnion<T extends readonly string[]> = T[number];

export type ListingCategory = TupleToUnion<typeof LISTING_CATEGORIES>;
export type DealType = TupleToUnion<typeof DEAL_TYPES>;
export type ListingStatus = TupleToUnion<typeof LISTING_STATUSES>;
export type PromotionType = TupleToUnion<typeof PROMOTION_TYPES>;
export type SpecialistRole = TupleToUnion<typeof SPECIALIST_ROLES>;
