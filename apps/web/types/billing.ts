export type PricingPlanCode = 'VIP' | 'TOP' | 'HIGHLIGHT';

export interface PricingPlan {
  id: string;
  code: PricingPlanCode;
  title: string;
  description: string | null;
  priceKzt: number;
  durationDays: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'DEBIT' | 'CREDIT' | 'REFUND' | 'ADJUST';

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amountKzt: number;
  orderId: string | null;
  meta: Record<string, any> | null;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balanceKzt: number;
  createdAt: string;
  updatedAt: string;
  transactions: WalletTransaction[];
}

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED';
export type BillingProvider = 'MOCK';
export type PayOrderMode = 'wallet' | 'card';
export type PromotionSubjectType = 'LISTING' | 'SPECIALIST';

export interface OrderItem {
  id: string;
  subjectType: PromotionSubjectType;
  subjectId: string;
  planCode: PricingPlanCode;
  priceKzt: number;
  durationDays: number;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalKzt: number;
  provider: BillingProvider;
  paymentMode: PayOrderMode | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  cancelledAt: string | null;
  items: OrderItem[];
  transactions?: WalletTransaction[];
}
