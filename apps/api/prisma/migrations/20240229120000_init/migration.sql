-- Prisma migration for initial Texnika.kz marketplace schema
-- Manual authoring for Phase A data layer setup

-- Enum definitions
CREATE TYPE "UserRole" AS ENUM ('USER', 'DEALER', 'MODERATOR', 'ADMIN');
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED', 'HIDDEN', 'ARCHIVED', 'BLOCKED');
CREATE TYPE "SellerType" AS ENUM ('PRIVATE', 'DEALER');
CREATE TYPE "DealType" AS ENUM ('SALE', 'RENT', 'LEASING');
CREATE TYPE "PromotionType" AS ENUM ('VIP', 'TOP', 'HIGHLIGHT', 'AUTOBUMP');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE "SpecialistAvailability" AS ENUM ('FULL_TIME', 'PART_TIME', 'SHIFT', 'TRAVEL');
CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');
CREATE TYPE "SpecialistPromotionType" AS ENUM ('VIP', 'TOP', 'HIGHLIGHT', 'AUTOBUMP');
CREATE TYPE "DealerPlan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- Reference data tables
CREATE TABLE "Region" (
  "id" VARCHAR(64) PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" VARCHAR(64) NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX "Region_slug_key" ON "Region" ("slug");

CREATE TABLE "City" (
  "id" VARCHAR(64) PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" VARCHAR(64) NOT NULL,
  "regionId" VARCHAR(64) NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "City_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "City_slug_key" ON "City" ("slug");
CREATE INDEX "City_regionId_idx" ON "City" ("regionId");

CREATE TABLE "Category" (
  "id" VARCHAR(64) PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dealer and user tables
CREATE TABLE "Dealer" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "innIin" TEXT,
  "description" TEXT,
  "website" TEXT,
  "addresses" JSONB,
  "logoKey" TEXT,
  "plan" "DealerPlan" NOT NULL DEFAULT 'FREE',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX "Dealer_slug_key" ON "Dealer" ("slug");

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "passwordHash" TEXT,
  "firstName" TEXT,
  "lastName" TEXT,
  "avatarUrl" TEXT,
  "isVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "lastLoginAt" TIMESTAMPTZ,
  "dealerId" TEXT,
  CONSTRAINT "User_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "Dealer"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "User_phone_key" ON "User" ("phone");
CREATE UNIQUE INDEX "User_email_key" ON "User" ("email") WHERE "email" IS NOT NULL;

-- Specialists table
CREATE TABLE "Specialist" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT,
  "categoryId" VARCHAR(64) NOT NULL,
  "profession" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "bio" TEXT,
  "phone" TEXT,
  "experienceYears" INTEGER NOT NULL DEFAULT 0,
  "rateHourly" NUMERIC(12, 2),
  "rateShift" NUMERIC(12, 2),
  "rateMonthly" NUMERIC(12, 2),
  "availability" "SpecialistAvailability" NOT NULL DEFAULT 'FULL_TIME',
  "hasOwnEquipment" BOOLEAN NOT NULL DEFAULT FALSE,
  "certifications" JSONB,
  "regionsServed" JSONB,
  "skills" TEXT[] NOT NULL DEFAULT '{}',
  "languages" TEXT[] NOT NULL DEFAULT '{}',
  "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "reviewsCount" INTEGER NOT NULL DEFAULT 0,
  "regionId" VARCHAR(64),
  "cityId" VARCHAR(64),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Specialist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Specialist_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Specialist_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Specialist_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "Specialist_cityId_idx" ON "Specialist" ("cityId");
CREATE INDEX "Specialist_availability_idx" ON "Specialist" ("availability");
CREATE INDEX "Specialist_rating_idx" ON "Specialist" ("rating");

-- Listings table
CREATE TABLE "Listing" (
  "id" TEXT PRIMARY KEY,
  "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
  "dealType" "DealType" NOT NULL DEFAULT 'SALE',
  "categoryId" VARCHAR(64) NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "priceKzt" NUMERIC(18, 2),
  "priceCurrency" TEXT NOT NULL DEFAULT 'KZT',
  "regionId" VARCHAR(64),
  "cityId" VARCHAR(64),
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "sellerType" "SellerType" NOT NULL DEFAULT 'PRIVATE',
  "userId" TEXT NOT NULL,
  "dealerId" TEXT,
  "params" JSONB,
  "specs" JSONB,
  "contactMasked" TEXT,
  "expiresAt" TIMESTAMPTZ,
  "publishedAt" TIMESTAMPTZ,
  "boostScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Listing_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Listing_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Listing_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Listing_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "Dealer"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Listing_slug_key" ON "Listing" ("slug");
CREATE INDEX "Listing_status_category_idx" ON "Listing" ("status", "categoryId");
CREATE INDEX "Listing_cityId_idx" ON "Listing" ("cityId");
CREATE INDEX "Listing_dealerId_idx" ON "Listing" ("dealerId");
CREATE INDEX "Listing_createdAt_idx" ON "Listing" ("createdAt");

-- Media assets
CREATE TABLE "Media" (
  "id" TEXT PRIMARY KEY,
  "kind" "MediaKind" NOT NULL DEFAULT 'IMAGE',
  "bucket" TEXT NOT NULL,
  "objectKey" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "previewUrl" TEXT,
  "checksum" TEXT,
  "metadata" JSONB,
  "listingId" TEXT,
  "specialistId" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Media_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Media_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "Specialist"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Media_listingId_idx" ON "Media" ("listingId");
CREATE INDEX "Media_specialistId_idx" ON "Media" ("specialistId");

-- Promotions
CREATE TABLE "Promotion" (
  "id" TEXT PRIMARY KEY,
  "listingId" TEXT NOT NULL,
  "type" "PromotionType" NOT NULL,
  "startsAt" TIMESTAMPTZ NOT NULL,
  "endsAt" TIMESTAMPTZ NOT NULL,
  "meta" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Promotion_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "SpecialistPromotion" (
  "id" TEXT PRIMARY KEY,
  "specialistId" TEXT NOT NULL,
  "type" "SpecialistPromotionType" NOT NULL,
  "startsAt" TIMESTAMPTZ NOT NULL,
  "endsAt" TIMESTAMPTZ NOT NULL,
  "meta" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "SpecialistPromotion_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "Specialist"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Reviews
CREATE TABLE "Review" (
  "id" TEXT PRIMARY KEY,
  "specialistId" TEXT NOT NULL,
  "reviewerId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Review_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "Specialist"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Review_specialistId_idx" ON "Review" ("specialistId");
CREATE INDEX "Review_rating_idx" ON "Review" ("rating");

-- Favorites
CREATE TABLE "Favorite" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "listingId" TEXT,
  "specialistId" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Favorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Favorite_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "Specialist"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_user_listing_key" UNIQUE ("userId", "listingId");
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_user_specialist_key" UNIQUE ("userId", "specialistId");

-- Conversations and messages
CREATE TABLE "Conversation" (
  "id" TEXT PRIMARY KEY,
  "listingId" TEXT,
  "specialistId" TEXT,
  "buyerId" TEXT NOT NULL,
  "sellerId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Conversation_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Conversation_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "Specialist"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Conversation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Conversation_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Conversation_listingId_idx" ON "Conversation" ("listingId");
CREATE INDEX "Conversation_specialistId_idx" ON "Conversation" ("specialistId");
CREATE INDEX "Conversation_participants_idx" ON "Conversation" ("buyerId", "sellerId");

CREATE TABLE "Message" (
  "id" TEXT PRIMARY KEY,
  "conversationId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "attachments" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Message_conversationId_idx" ON "Message" ("conversationId");
CREATE INDEX "Message_senderId_idx" ON "Message" ("senderId");

-- Orders and billing
CREATE TABLE "Order" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "dealerId" TEXT,
  "listingId" TEXT,
  "specialistId" TEXT,
  "promotionType" "PromotionType",
  "amountKzt" NUMERIC(18, 2) NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "provider" TEXT NOT NULL,
  "providerPayload" JSONB,
  "items" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "paidAt" TIMESTAMPTZ,
  CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Order_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "Dealer"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Order_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Order_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "Specialist"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "Order_status_idx" ON "Order" ("status");
CREATE INDEX "Order_dealerId_idx" ON "Order" ("dealerId");
CREATE INDEX "Order_createdAt_idx" ON "Order" ("createdAt");

-- Audit trail
CREATE TABLE "AuditLog" (
  "id" TEXT PRIMARY KEY,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "meta" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "AuditLog_entity_idx" ON "AuditLog" ("entity", "entityId");
