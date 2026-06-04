-- AlterTable: shared/individual goals + stable sync identity
ALTER TABLE "Goal" ADD COLUMN "uid" TEXT;
ALTER TABLE "Goal" ADD COLUMN "isShared" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Goal" ADD COLUMN "ownerId" TEXT;

-- Backfill: existing goals were household-wide, so treat them as shared and
-- give each a unique uid derived from its id.
UPDATE "Goal" SET "uid" = 'leg_' || "id"::text, "isShared" = true WHERE "uid" IS NULL;

CREATE UNIQUE INDEX "Goal_uid_key" ON "Goal"("uid");
