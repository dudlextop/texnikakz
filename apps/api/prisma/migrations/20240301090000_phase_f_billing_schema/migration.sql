-- Phase F billing schema migration
-- Introduces pricing plans, wallets, orders, transactions, and promotion activations

-- New enums for billing and promotions
CREATE TYPE "PricingPlanCode" AS ENUM ('VIP', 'TOP', 'HIGHLIGHT');
CREATE TYPE "PromotionSubjectType" AS ENUM ('LISTING', 'SPECIALIST');
CREATE TYPE "PromotionActivationStatus" AS ENUM ('ACTIVE', 'EXPIRED');
CREATE TYPE "BillingProvider" AS ENUM ('MOCK');
CREATE TYPE "TransactionType" AS ENUM ('DEBIT', 'CREDIT', 'REFUND', 'ADJUST');

-- Update order status domain to include cancellation and drop legacy refunded state
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'FAILED');
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING (
  CASE
    WHEN "status"::text = 'REFUNDED' THEN 'CANCELLED'
    ELSE "status"::text
  END
)::"OrderStatus_new";
DROP TYPE "OrderStatus";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";

-- Teardown legacy relations no longer used in new billing domain
DROP INDEX IF EXISTS "Order_dealerId_idx";
ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_dealerId_fkey";
ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_listingId_fkey";
ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_specialistId_fkey";

-- Remove obsolete promotion tables
DROP TABLE IF EXISTS "Promotion";
DROP TABLE IF EXISTS "SpecialistPromotion";

-- Adjust order structure to new shape
ALTER TABLE "Order"
  RENAME COLUMN "amountKzt" TO "totalKzt";

ALTER TABLE "Order"
  ALTER COLUMN "totalKzt" TYPE INTEGER USING ROUND("totalKzt")::INTEGER,
  ALTER COLUMN "provider" TYPE "BillingProvider" USING (
    CASE
      WHEN "provider"::text = 'MOCK' THEN 'MOCK'
      ELSE 'MOCK'
    END
  )::"BillingProvider",
  ADD COLUMN     "paymentMode" TEXT,
  ADD COLUMN     "metadata" JSONB,
  ADD COLUMN     "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN     "cancelledAt" TIMESTAMPTZ,
  DROP COLUMN    "dealerId",
  DROP COLUMN    "listingId",
  DROP COLUMN    "specialistId",
  DROP COLUMN    "promotionType",
  DROP COLUMN    "providerPayload",
  DROP COLUMN    "items";

ALTER TABLE "Order"
  ALTER COLUMN "provider" SET DEFAULT 'MOCK';

CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order" ("userId");

-- Pricing plans catalog
CREATE TABLE "PricingPlan" (
  "id" TEXT PRIMARY KEY,
  "code" "PricingPlanCode" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "priceKzt" INTEGER NOT NULL,
  "durationDays" INTEGER NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX "PricingPlan_code_key" ON "PricingPlan" ("code");

-- User wallets
CREATE TABLE "Wallet" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "balanceKzt" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet" ("userId");

-- Order items for granular promotions
CREATE TABLE "OrderItem" (
  "id" TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "subjectType" "PromotionSubjectType" NOT NULL,
  "subjectId" TEXT NOT NULL,
  "planCode" "PricingPlanCode" NOT NULL,
  "priceKzt" INTEGER NOT NULL,
  "durationDays" INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem" ("orderId");
CREATE INDEX "OrderItem_subject_idx" ON "OrderItem" ("subjectType", "subjectId");

-- Wallet transactions ledger
CREATE TABLE "Transaction" (
  "id" TEXT PRIMARY KEY,
  "walletId" TEXT NOT NULL,
  "orderId" TEXT,
  "type" "TransactionType" NOT NULL,
  "amountKzt" INTEGER NOT NULL,
  "meta" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Transaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "Transaction_walletId_idx" ON "Transaction" ("walletId");
CREATE INDEX "Transaction_orderId_idx" ON "Transaction" ("orderId");

-- Promotion activations replacing legacy promotions
CREATE TABLE "PromotionActivation" (
  "id" TEXT PRIMARY KEY,
  "subjectType" "PromotionSubjectType" NOT NULL,
  "subjectId" TEXT NOT NULL,
  "planCode" "PricingPlanCode" NOT NULL,
  "startedAt" TIMESTAMPTZ NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "orderItemId" TEXT,
  "status" "PromotionActivationStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "PromotionActivation_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "PromotionActivation_subject_idx" ON "PromotionActivation" ("subjectType", "subjectId");
CREATE INDEX "PromotionActivation_expiresAt_idx" ON "PromotionActivation" ("expiresAt");
