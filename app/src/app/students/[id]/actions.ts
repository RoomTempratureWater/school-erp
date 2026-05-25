"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateStudent(formData: FormData) {
  const id = parseInt(formData.get("id") as string, 10);
  const firstName = formData.get("firstName") as string;
  const middleName = formData.get("middleName") as string;
  const lastName = formData.get("lastName") as string;
  const standard = formData.get("standard") as string;
  const division = formData.get("division") as string;
  const dateOfBirth = formData.get("dateOfBirth") as string;
  const dateOfAdmission = formData.get("dateOfAdmission") as string;
  const dateOfLeaving = formData.get("dateOfLeaving") as string;
  const status = formData.get("status") as string;

  const aadharNo = formData.get("aadharNo") as string;
  const stateCode = formData.get("stateCode") as string;
  const penNo = formData.get("penNo") as string;
  const apparId = formData.get("apparId") as string;
  const bloodGroup = formData.get("bloodGroup") as string;
  const motherTongue = formData.get("motherTongue") as string;
  const religion = formData.get("religion") as string;
  const caste = formData.get("caste") as string;
  const category = formData.get("category") as string;
  const birthCity = formData.get("birthCity") as string;
  const birthState = formData.get("birthState") as string;
  const currentAddress = formData.get("currentAddress") as string;
  
  const fatherName = formData.get("fatherName") as string;
  const motherName = formData.get("motherName") as string;
  const mobileNumber = formData.get("mobileNumber") as string;
  const contactEmail = formData.get("contactEmail") as string;

  await prisma.student.update({
    where: { id },
    data: {
      firstName,
      middleName: middleName || null,
      lastName,
      standard,
      division,
      dateOfBirth: new Date(dateOfBirth),
      dateOfAdmission: dateOfAdmission ? new Date(dateOfAdmission) : undefined,
      dateOfLeaving: dateOfLeaving ? new Date(dateOfLeaving) : null,
      aadharNo: aadharNo || null,
      stateCode: stateCode || null,
      penNo: penNo || null,
      apparId: apparId || null,
      bloodGroup: bloodGroup || null,
      motherTongue: motherTongue || null,
      religion: religion || null,
      caste: caste || null,
      category: category || null,
      birthCity: birthCity || null,
      birthState: birthState || null,
      currentAddress: currentAddress || null,
      fatherName: fatherName || null,
      motherName: motherName || null,
      mobileNumber: mobileNumber || null,
      contactEmail: contactEmail || null,
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
