"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function processPayment(formData: FormData) {
  const grNo = formData.get("grNo") as string;
  const feeCategoryId = parseInt(formData.get("feeCategoryId") as string, 10);
  const amount = parseFloat(formData.get("amount") as string);
  const paymentMethod = formData.get("paymentMethod") as any;
  const reference = formData.get("reference") as string;

  const student = await prisma.student.findUnique({ where: { grNo } });
  if (!student) throw new Error("Student not found");

  let studentFee = await prisma.studentFee.findFirst({
    where: { studentId: student.id, feeCategoryId }
  });

  const feeCategory = await prisma.feeCategory.findUnique({ where: { id: feeCategoryId } });

  if (!studentFee) {
    if (!feeCategory) throw new Error("Fee Category not found");
    studentFee = await prisma.studentFee.create({
      data: {
        studentId: student.id,
        feeCategoryId,
        amountDue: feeCategory.amount,
        amountPaid: amount,
        status: amount >= feeCategory.amount ? "PAID" : "PARTIAL",
        studentStandard: student.standard,
        studentDivision: student.division
      }
    });
  } else {
    const newPaid = studentFee.amountPaid + amount;
    await prisma.studentFee.update({
      where: { id: studentFee.id },
      data: {
        amountPaid: newPaid,
        status: newPaid >= studentFee.amountDue ? "PAID" : "PARTIAL"
      }
    });
  }

  await prisma.paymentTransaction.create({
    data: {
      studentFeeId: studentFee.id,
      amount,
      paymentMethod,
      reference: reference || null
    }
  });

  revalidatePath("/fees");
}

export async function filterFees(formData: FormData) {
  const q = formData.get("q") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  const yearId = formData.get("yearId") as string;
  const dateFrom = formData.get("dateFrom") as string;
  const dateTo = formData.get("dateTo") as string;
  const reference = formData.get("reference") as string;
  
  const params = new URLSearchParams();
  if (q) params.set("search", q);
  if (paymentMethod) params.set("paymentMethod", paymentMethod);
  if (yearId) params.set("yearId", yearId);
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);
  if (reference) params.set("reference", reference);
  
  return params.toString();
}

export async function filterDues(formData: FormData) {
  const q = formData.get("q") as string;
  const yearId = formData.get("yearId") as string;
  const dateFrom = formData.get("duesDateFrom") as string;
  const dateTo = formData.get("duesDateTo") as string;
  const reference = formData.get("duesReference") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  
  // Preserve existing ledger filters
  const ledgerSearch = formData.get("ledgerSearch") as string;
  const ledgerPaymentMethod = formData.get("ledgerPaymentMethod") as string;
  const ledgerDateFrom = formData.get("ledgerDateFrom") as string;
  const ledgerDateTo = formData.get("ledgerDateTo") as string;
  const ledgerReference = formData.get("ledgerReference") as string;
  
  const params = new URLSearchParams();
  // Dues filters
  if (q) params.set("duesSearch", q);
  if (dateFrom) params.set("duesDateFrom", dateFrom);
  if (dateTo) params.set("duesDateTo", dateTo);
  if (reference) params.set("duesReference", reference);
  if (yearId) params.set("yearId", yearId);
  
  // Preserve ledger filters
  if (ledgerSearch) params.set("search", ledgerSearch);
  if (ledgerPaymentMethod) params.set("paymentMethod", ledgerPaymentMethod);
  if (ledgerDateFrom) params.set("dateFrom", ledgerDateFrom);
  if (ledgerDateTo) params.set("ledgerDateTo", ledgerDateTo);
  if (ledgerReference) params.set("reference", ledgerReference);
  
  return params.toString();
}

export async function deleteStudentFee(id: number) {
  try {
    await prisma.studentFee.delete({
      where: { id }
    });
    revalidatePath("/fees");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2003') {
      return { success: false, error: "Cannot delete: This fee already has recorded payment transactions." };
    }
    return { success: false, error: "An unexpected error occurred while deleting." };
  }
}

export async function deletePaymentTransaction(id: number) {
  try {
    // We need to do this in a transaction to ensure ledger consistency
    await prisma.$transaction(async (tx: any) => {
      const transaction = await tx.paymentTransaction.findUnique({
        where: { id },
        include: { studentFee: true }
      });

      if (!transaction) throw new Error("Transaction not found");

      const fee = transaction.studentFee;
      const newPaid = fee.amountPaid - transaction.amount;
      const newStatus = newPaid <= 0 ? "PENDING" : (newPaid < fee.amountDue ? "PARTIAL" : "PAID");

      await tx.studentFee.update({
        where: { id: fee.id },
        data: {
          amountPaid: Math.max(0, newPaid),
          status: newStatus
        }
      });

      await tx.paymentTransaction.delete({
        where: { id }
      });
    });
    
    revalidatePath("/fees");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete transaction." };
  }
}
