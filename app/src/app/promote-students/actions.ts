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
    // Perform updates in a transaction
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

    revalidatePath("/promote-students");
    revalidatePath("/students");
    return { success: true };
  } catch (error) {
    console.error("Promotion Error:", error);
    return { success: false, error: "Failed to promote students" };
  }
}
