-- Merchant: per-merchant auto-confirm flag (Pro smart auto-rules), now synced.
ALTER TABLE "Merchant" ADD COLUMN "autoConfirm" BOOLEAN NOT NULL DEFAULT false;

-- NetWorthSnapshot: Pro net-worth tracker history, mirrored on sync so a
-- reinstall restores it.
CREATE TABLE "NetWorthSnapshot" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assets" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "liabilities" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NetWorthSnapshot_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "NetWorthSnapshot_userId_idx" ON "NetWorthSnapshot"("userId");
ALTER TABLE "NetWorthSnapshot" ADD CONSTRAINT "NetWorthSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
