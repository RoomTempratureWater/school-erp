/*
  Warnings:

  - You are about to drop the column `academicYear` on the `exams` table. All the data in the column will be lost.
  - Added the required column `academicYearId` to the `exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjects` to the `exams` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "exams" DROP COLUMN "academicYear",
ADD COLUMN     "academicYearId" INTEGER NOT NULL,
ADD COLUMN     "examDate" TIMESTAMP(3),
ADD COLUMN     "subjects" JSONB NOT NULL;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
