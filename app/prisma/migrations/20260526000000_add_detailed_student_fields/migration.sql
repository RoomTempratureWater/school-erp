-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "PromotionStatus" AS ENUM ('PROMOTED', 'DETAINED', 'RE_EXAM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- DropIndex
DROP INDEX IF EXISTS "students_enrollmentNo_key";

-- AlterTable
ALTER TABLE "marks" ADD COLUMN IF NOT EXISTS "graceMarks" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "staff" ADD COLUMN IF NOT EXISTS "dateOfJoining" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "dateOfLeaving" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "memos" JSONB,
ADD COLUMN IF NOT EXISTS "reasonForLeaving" TEXT;

-- AlterTable
ALTER TABLE "student_promotions" ADD COLUMN IF NOT EXISTS "status" "PromotionStatus" NOT NULL DEFAULT 'PROMOTED';

-- AlterTable
ALTER TABLE "students" DROP COLUMN IF EXISTS "contactNumber",
DROP COLUMN IF EXISTS "parentName",
ADD COLUMN IF NOT EXISTS "aadharNo" TEXT,
ADD COLUMN IF NOT EXISTS "alternateMobileNumber" TEXT,
ADD COLUMN IF NOT EXISTS "apparId" TEXT,
ADD COLUMN IF NOT EXISTS "birthCity" TEXT,
ADD COLUMN IF NOT EXISTS "birthCountry" TEXT,
ADD COLUMN IF NOT EXISTS "birthDistrict" TEXT,
ADD COLUMN IF NOT EXISTS "birthState" TEXT,
ADD COLUMN IF NOT EXISTS "birthTaluka" TEXT,
ADD COLUMN IF NOT EXISTS "bloodGroup" TEXT,
ADD COLUMN IF NOT EXISTS "caste" TEXT,
ADD COLUMN IF NOT EXISTS "category" TEXT,
ADD COLUMN IF NOT EXISTS "contactEmail" TEXT,
ADD COLUMN IF NOT EXISTS "currentAddress" TEXT,
ADD COLUMN IF NOT EXISTS "date_of_admission" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "date_of_leaving" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "fatherName" TEXT,
ADD COLUMN IF NOT EXISTS "guardianName" TEXT,
ADD COLUMN IF NOT EXISTS "middleName" TEXT,
ADD COLUMN IF NOT EXISTS "minorityGroup" TEXT,
ADD COLUMN IF NOT EXISTS "mobileNumber" TEXT,
ADD COLUMN IF NOT EXISTS "motherName" TEXT,
ADD COLUMN IF NOT EXISTS "motherTongue" TEXT,
ADD COLUMN IF NOT EXISTS "penNo" TEXT,
ADD COLUMN IF NOT EXISTS "pinCode" TEXT,
ADD COLUMN IF NOT EXISTS "religion" TEXT,
ADD COLUMN IF NOT EXISTS "stateCode" TEXT;

DO $$ BEGIN
    IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='students' and column_name='enrollmentNo') THEN
        ALTER TABLE "students" RENAME COLUMN "enrollmentNo" TO "grNo";
    END IF;
END $$;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "students_grNo_key" ON "students"("grNo");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "students_aadharNo_key" ON "students"("aadharNo");
