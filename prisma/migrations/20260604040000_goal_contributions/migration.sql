-- CreateTable: GoalContribution — append-only ledger of shared-goal funding
CREATE TABLE "GoalContribution" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "goalUid" TEXT NOT NULL,
    "contributorId" TEXT,
    "contributorName" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoalContribution_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "GoalContribution_uid_key" ON "GoalContribution"("uid");
CREATE INDEX "GoalContribution_householdId_idx" ON "GoalContribution"("householdId");
ALTER TABLE "GoalContribution" ADD CONSTRAINT "GoalContribution_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
