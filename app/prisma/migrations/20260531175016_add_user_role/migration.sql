-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PRINCIPAL', 'MANAGEMENT');

-- AlterTable
ALTER TABLE "internal_users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'PRINCIPAL';
