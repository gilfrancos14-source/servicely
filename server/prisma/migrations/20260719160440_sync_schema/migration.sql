-- Sync users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notificationSettings" JSONB;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordChangedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "loyaltyPoints" INTEGER NOT NULL DEFAULT 0;

-- Sync providers table
ALTER TABLE "providers" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "providers" ADD COLUMN IF NOT EXISTS "level" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "providers" ADD COLUMN IF NOT EXISTS "paypalEmail" TEXT;

-- Sync services table
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "unit" TEXT;

-- Sync unique constraint on time_slots
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'time_slots_providerId_serviceId_startTime_endTime_key'
  ) THEN
    ALTER TABLE "time_slots" ADD CONSTRAINT "time_slots_providerId_serviceId_startTime_endTime_key" UNIQUE ("providerId", "serviceId", "startTime", "endTime");
  END IF;
END $$;
