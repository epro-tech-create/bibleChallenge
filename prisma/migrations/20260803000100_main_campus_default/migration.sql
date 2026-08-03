-- Repair installations created before the Main Campus field was placed on Family.
ALTER TABLE "Family" ADD COLUMN IF NOT EXISTS "location" TEXT NOT NULL DEFAULT 'Main Campus';
ALTER TABLE "Family" ALTER COLUMN "location" SET DEFAULT 'Main Campus';
