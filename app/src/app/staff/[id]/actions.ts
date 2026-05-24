"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateStaff(formData: FormData) {
  const id = parseInt(formData.get("id") as string, 10);
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const role = formData.get("role") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const jobDescription = formData.get("jobDescription") as string;
  const dosAndDonts = formData.get("dosAndDonts") as string;
  const achievements = formData.get("achievements") as string;
  const dateOfJoining = formData.get("dateOfJoining") as string;
  const dateOfLeaving = formData.get("dateOfLeaving") as string;
  const reasonForLeaving = formData.get("reasonForLeaving") as string;
  const memos = formData.get("memos") as string;

  await prisma.staff.update({
    where: { id },
    data: {
      firstName,
      lastName,
      role: role as any,
      address: address || null,
      phone: phone || null,
      jobDescription: jobDescription || null,
      dosAndDonts: dosAndDonts || null,
      achievements: achievements || null,
      dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : null,
      dateOfLeaving: dateOfLeaving ? new Date(dateOfLeaving) : null,
      reasonForLeaving: reasonForLeaving || null,
      memos: memos ? [{ text: memos, date: new Date().toISOString() }] : null,
    },
  });

  revalidatePath(`/staff/${id}`);
}

export async function deleteStaffDocument(docId: number) {
  await prisma.staffDocument.delete({ where: { id: docId } });
}
