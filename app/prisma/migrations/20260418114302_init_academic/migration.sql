/*
  Warnings:

  - You are about to drop the column `academicYear` on the `fee_categories` table. All the data in the column will be lost.
  - Added the required column `academicYearId` to the `fee_categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "fee_categories" DROP COLUMN "academicYear",
ADD COLUMN     "academicYearId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "academic_years" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_name_key" ON "academic_years"("name");

-- AddForeignKey
ALTER TABLE "fee_categories" ADD CONSTRAINT "fee_categories_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
