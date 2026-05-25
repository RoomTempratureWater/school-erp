"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addStudent(formData: FormData) {
  const grNo = formData.get("grNo") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const standard = formData.get("standard") as string;
  const division = formData.get("division") as string;
  const dateOfBirth = formData.get("dateOfBirth") as string;
  const dateOfAdmission = formData.get("dateOfAdmission") as string;
  
  // Optional detailed fields
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

  if (!grNo || !firstName || !lastName || !standard || !division || !dateOfBirth) {
    throw new Error("Missing required fields.");
  }

  const student = await prisma.student.create({
    data: {
      grNo,
      firstName,
      lastName,
      standard,
      division,
      dateOfBirth: new Date(dateOfBirth),
      dateOfAdmission: dateOfAdmission ? new Date(dateOfAdmission) : undefined,
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
      status: "ACTIVE"
    }
  });

  const currentYear = await prisma.academicYear.findFirst({
    where: { isCurrent: true }
  });

  if (currentYear) {
    const feeCategories = await prisma.feeCategory.findMany({
      where: {
        academicYearId: currentYear.id,
        standard: student.standard
      }
    });

    if (feeCategories.length > 0) {
      await prisma.studentFee.createMany({
        data: feeCategories.map(fc => ({
          studentId: student.id,
          feeCategoryId: fc.id,
          amountDue: fc.amount,
          amountPaid: 0,
          status: "PENDING",
          studentStandard: student.standard,
          studentDivision: student.division
        }))
      });
    }
  }

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
