"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function promoteStudents(
  targetYearId: number,
  promotions: Array<{
    studentId: number;
    fromStandard: string;
    fromDivision: string;
    toStandard: string;
    toDivision: string;
  }>
) {
  try {
    // We can't do createMany inside a mapped transaction array easily if we want to query fee categories dynamically per standard, 
    // so we'll do the core updates first, then bulk assign fees.

    // 1. Perform promotions in transaction
    await prisma.$transaction(
      promotions.map((p) => [
        // Update Student
        prisma.student.update({
          where: { id: p.studentId },
          data: {
            standard: p.toStandard,
            division: p.toDivision,
          },
        }),
        // Create Promotion Record
        prisma.studentPromotion.create({
          data: {
            studentId: p.studentId,
            academicYearId: targetYearId,
            fromStandard: p.fromStandard,
            fromDivision: p.fromDivision,
            toStandard: p.toStandard,
            toDivision: p.toDivision,
            remarks: "Promoted via Mass Promotion",
          },
        }),
      ]).flat()
    );

    // 2. Fetch all standard-specific fee categories for the target year
    const targetFees = await prisma.feeCategory.findMany({
      where: {
        academicYearId: targetYearId,
        standard: { not: null }
      }
    });

    if (targetFees.length > 0) {
      const pendingFeesToCreate = [];

      for (const p of promotions) {
        // Find fees matching the student's new standard
        const applicableFees = targetFees.filter(f => f.standard === p.toStandard);
        
        for (const fee of applicableFees) {
          pendingFeesToCreate.push({
            studentId: p.studentId,
            feeCategoryId: fee.id,
            amountDue: fee.amount,
            amountPaid: 0,
            status: "PENDING" as const,
            studentStandard: p.toStandard,
            studentDivision: p.toDivision
          });
        }
      }

      if (pendingFeesToCreate.length > 0) {
        await prisma.studentFee.createMany({
          data: pendingFeesToCreate
        });
      }
    }

    revalidatePath("/promote-students");
    revalidatePath("/students");
    revalidatePath("/fees");
    return { success: true };
  } catch (error) {
    console.error("Promotion Error:", error);
    return { success: false, error: "Failed to promote students" };
  }
}
