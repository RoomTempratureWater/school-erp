"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createAcademicYear(formData: FormData) {
  const name = formData.get("name") as string;
  const isCurrent = formData.get("isCurrent") === "on";

  if (isCurrent) {
    await prisma.academicYear.updateMany({ data: { isCurrent: false } });
  }

  await prisma.academicYear.create({
    data: { name, isCurrent }
  });

  revalidatePath("/school-year-setup");
  revalidatePath("/fees");
}

export async function createFeeCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const academicYearId = parseInt(formData.get("academicYearId") as string, 10);
  const standard = formData.get("standard") as string;

  await prisma.feeCategory.create({
    data: {
      name,
      amount,
      academicYearId,
      standard: standard || null
    }
  });

  revalidatePath("/school-year-setup");
  revalidatePath("/fees");
}

export async function deleteFeeCategory(id: number) {
  try {
    await prisma.feeCategory.delete({
      where: { id }
    });
    revalidatePath("/school-year-setup");
    revalidatePath("/fees");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2003') {
      return { success: false, error: "Cannot delete: Students are already assigned this fee." };
    }
    return { success: false, error: "An unexpected error occurred while deleting." };
  }
}
