-- AlterTable
ALTER TABLE "users" ADD COLUMN "mfa_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "mfa_secret" TEXT;
ALTER TABLE "users" ADD COLUMN "mfa_backup_codes" TEXT[] DEFAULT ARRAY[]::TEXT[];
