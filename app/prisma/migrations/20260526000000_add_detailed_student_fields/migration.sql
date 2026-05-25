-- CreateEnum
CREATE TYPE "PromotionStatus" AS ENUM ('PROMOTED', 'DETAINED', 'RE_EXAM');

-- DropIndex
DROP INDEX "students_enrollmentNo_key";

-- AlterTable
ALTER TABLE "marks" ADD COLUMN     "graceMarks" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "staff" ADD COLUMN     "dateOfJoining" TIMESTAMP(3),
ADD COLUMN     "dateOfLeaving" TIMESTAMP(3),
ADD COLUMN     "memos" JSONB,
ADD COLUMN     "reasonForLeaving" TEXT;

-- AlterTable
ALTER TABLE "student_promotions" ADD COLUMN     "status" "PromotionStatus" NOT NULL DEFAULT 'PROMOTED';

-- AlterTable
ALTER TABLE "students" DROP COLUMN "contactNumber",
DROP COLUMN "enrollmentNo",
DROP COLUMN "parentName",
ADD COLUMN     "aadharNo" TEXT,
ADD COLUMN     "alternateMobileNumber" TEXT,
ADD COLUMN     "apparId" TEXT,
ADD COLUMN     "birthCity" TEXT,
ADD COLUMN     "birthCountry" TEXT,
ADD COLUMN     "birthDistrict" TEXT,
ADD COLUMN     "birthState" TEXT,
ADD COLUMN     "birthTaluka" TEXT,
ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "caste" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "currentAddress" TEXT,
ADD COLUMN     "date_of_admission" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date_of_leaving" TIMESTAMP(3),
ADD COLUMN     "fatherName" TEXT,
ADD COLUMN     "grNo" TEXT NOT NULL,
ADD COLUMN     "guardianName" TEXT,
ADD COLUMN     "middleName" TEXT,
ADD COLUMN     "minorityGroup" TEXT,
ADD COLUMN     "mobileNumber" TEXT,
ADD COLUMN     "motherName" TEXT,
ADD COLUMN     "motherTongue" TEXT,
ADD COLUMN     "penNo" TEXT,
ADD COLUMN     "pinCode" TEXT,
ADD COLUMN     "religion" TEXT,
ADD COLUMN     "stateCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "students_grNo_key" ON "students"("grNo");

-- CreateIndex
CREATE UNIQUE INDEX "students_aadharNo_key" ON "students"("aadharNo");

