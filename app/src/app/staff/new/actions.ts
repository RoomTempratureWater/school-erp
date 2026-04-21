"use server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createStaff(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const employeeId = formData.get("employeeId") as string;
  const role = formData.get("role") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const jobDescription = formData.get("jobDescription") as string;
  const dosAndDonts = formData.get("dosAndDonts") as string;
  const achievements = formData.get("achievements") as string;

  const staff = await prisma.staff.create({
    data: {
      firstName,
      lastName,
      employeeId,
      role: role as any,
      address: address || null,
      phone: phone || null,
      jobDescription: jobDescription || null,
      dosAndDonts: dosAndDonts || null,
      achievements: achievements || null,
    },
  });

  redirect(`/staff/${staff.id}`);
}
