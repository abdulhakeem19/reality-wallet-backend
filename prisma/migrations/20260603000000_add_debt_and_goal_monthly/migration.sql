-- AlterTable: add monthly contribution to Goal
ALTER TABLE "Goal" ADD COLUMN "monthlyContribution" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable: track last sync time per user (for "most recent device wins")
ALTER TABLE "User" ADD COLUMN "lastSyncedAt" TIMESTAMP(3);

-- CreateTable: Debt (user-owned)
CREATE TABLE "Debt" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originalAmount" DOUBLE PRECISION NOT NULL,
    "currentBalance" DOUBLE PRECISION NOT NULL,
    "monthlyPayment" DOUBLE PRECISION NOT NULL,
    "interestRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Debt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
