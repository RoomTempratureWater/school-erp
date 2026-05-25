"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateStudent(formData: FormData) {
  const id = parseInt(formData.get("id") as string, 10);
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const standard = formData.get("standard") as string;
  const division = formData.get("division") as string;
  const dateOfBirth = formData.get("dateOfBirth") as string;
  const parentName = formData.get("parentName") as string;
  const contactNumber = formData.get("contactNumber") as string;
  const status = formData.get("status") as string;

  await prisma.student.update({
    where: { id },
    data: {
      firstName,
      lastName,
      standard,
      division,
      dateOfBirth: new Date(dateOfBirth),
      parentName: parentName || null,
      contactNumber: contactNumber || null,
      status: status as any,
    },
  });

  revalidatePath(`/students/${id}`);
}

export async function deleteDocument(docId: number) {
  await prisma.studentDocument.delete({ where: { id: docId } });
}

export async function updateGraceMarks(formData: FormData) {
  const markId = parseInt(formData.get("markId") as string, 10);
  const studentId = parseInt(formData.get("studentId") as string, 10);
  const graceMarksStr = formData.get("graceMarks") as string;
  const graceMarks = graceMarksStr ? parseFloat(graceMarksStr) : 0;

  if (isNaN(markId) || isNaN(studentId)) return;

  await prisma.mark.update({
    where: { id: markId },
    data: { graceMarks }
  });

  revalidatePath(`/students/${studentId}`);
}
