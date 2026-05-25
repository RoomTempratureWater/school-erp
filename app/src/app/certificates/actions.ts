'use server'

import { prisma } from "@/lib/prisma";
import { CertificateType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getCertificates(filters?: { name?: string; standard?: string; date?: string }) {
  const where: any = {};

  if (filters?.name) {
    where.student = {
      OR: [
        { firstName: { contains: filters.name, mode: "insensitive" } },
        { lastName: { contains: filters.name, mode: "insensitive" } },
      ],
    };
  }

  if (filters?.standard) {
    if (!where.student) where.student = {};
    where.student.standard = filters.standard;
  }

  if (filters?.date) {
    // Filter by issuedAt date
    const startOfDay = new Date(filters.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(filters.date);
    endOfDay.setHours(23, 59, 59, 999);
    
    where.issuedAt = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  const certificates = await prisma.certificate.findMany({
    where,
    include: {
      student: true,
    },
    orderBy: {
      issuedAt: 'desc',
    },
  });

  return certificates;
}

export async function createCertificate(data: { grNo: string; type: CertificateType }) {
  const student = await prisma.student.findUnique({
    where: { grNo: data.grNo }
  });

  if (!student) {
    throw new Error("Student not found");
  }

  const certificate = await prisma.certificate.create({
    data: {
      studentId: student.id,
      type: data.type,
    },
  });

  revalidatePath('/certificates');
  return certificate;
}

export async function getCertificateById(id: number) {
  return prisma.certificate.findUnique({
    where: { id },
    include: {
      student: true,
    },
  });
}

export async function getStudentsForDropdown() {
  return prisma.student.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      standard: true,
      division: true,
      grNo: true,
    },
    orderBy: [
      { standard: 'asc' },
      { firstName: 'asc' }
    ]
  });
}
