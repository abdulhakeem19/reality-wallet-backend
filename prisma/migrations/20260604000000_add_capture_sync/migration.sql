-- AlterTable: auto-capture metadata + merchant relink key on Transaction
ALTER TABLE "Transaction" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE "Transaction" ADD COLUMN "refNo" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "rawMessage" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "accountLast4" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "bankName" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "tags" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "merchantKey" TEXT;

-- CreateTable: Merchant (user-owned) — normalized counterparty + learned name/category
CREATE TABLE "Merchant" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "rawKey" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'other',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Merchant_userId_rawKey_key" ON "Merchant"("userId", "rawKey");
ALTER TABLE "Merchant" ADD CONSTRAINT "Merchant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: Account (user-owned) — bank/card auto-created from captures
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "last4" TEXT,
    "type" TEXT NOT NULL DEFAULT 'other',
    "displayName" TEXT,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: Category (user-owned) — custom categories the user adds
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '🏷️',
    -- ARGB color as a number (overflows 32-bit INTEGER, so DOUBLE PRECISION;
    -- exact for integers below 2^53). 0xFF27B07A = 4280791162.
    "colorValue" DOUBLE PRECISION NOT NULL DEFAULT 4280791162,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Category_userId_name_key" ON "Category"("userId", "name");
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
