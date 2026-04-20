"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addStudent(formData: FormData) {
  const enrollmentNo = formData.get("enrollmentNo") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const standard = formData.get("standard") as string;
  const division = formData.get("division") as string;
  const dateOfBirth = formData.get("dateOfBirth") as string;
  const parentName = formData.get("parentName") as string;
  const contactNumber = formData.get("contactNumber") as string;

  if (!enrollmentNo || !firstName || !lastName || !standard || !division || !dateOfBirth) {
    throw new Error("Missing required fields.");
  }

  await prisma.student.create({
    data: {
      enrollmentNo,
      firstName,
      lastName,
      standard,
      division,
      dateOfBirth: new Date(dateOfBirth),
      parentName: parentName || null,
      contactNumber: contactNumber || null,
      status: "ACTIVE"
    }
  });

  revalidatePath("/admission");
}

export async function filterAdmissions(formData: FormData) {
  const q = formData.get("q") as string;
  const std = formData.get("standard") as string;
  const div = formData.get("division") as string;
  
  const params = new URLSearchParams();
  if (q) params.set("search", q);
  if (std) params.set("standard", std);
  if (div) params.set("division", div);
  
  return params.toString();
}
