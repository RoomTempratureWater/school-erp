"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import papaparse from "papaparse";

export async function createExam(formData: FormData) {
  const name = formData.get("name") as string;
  const standard = formData.get("standard") as string;
  const academicYearId = parseInt(formData.get("academicYearId") as string, 10);
  const examDateStr = formData.get("examDate") as string;
  const subjectsRaw = formData.get("subjects") as string;

  if (!subjectsRaw || subjectsRaw === "[]") {
    throw new Error("At least one subject is required");
  }

  const subjects = JSON.parse(subjectsRaw);
  const examDate = examDateStr ? new Date(examDateStr) : null;

  await prisma.exam.create({
    data: {
      name,
      standard,
      academicYearId,
      examDate,
      subjects
    }
  });

  revalidatePath("/exam-setup");
}

export async function parseAndUploadMarks(formData: FormData) {
  const examId = parseInt(formData.get("examId") as string, 10);
  const file = formData.get("file") as File;

  if (!examId || !file) {
    throw new Error("Missing exam ID or file");
  }

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) throw new Error("Exam not found");

  const text = await file.text();
  
  const parsed = papaparse.parse<any>(text, { header: true, skipEmptyLines: true });
  if (parsed.errors.length > 0) {
    throw new Error("CSV Parsing Error: " + parsed.errors[0].message);
  }

  const data = parsed.data;
  const subjects = exam.subjects as Array<{ name: string; maxMarks: string | number }>;

  await prisma.$transaction(async (tx) => {
    for (const row of data) {
      const enrollmentNo = row["EnrollmentNo"];
      if (!enrollmentNo) continue;

      const student = await tx.student.findUnique({ where: { enrollmentNo } });
      if (!student) {
        // Log skip or error. For now, continue
        continue;
      }

      // Check marks for each subject
      for (const subject of subjects) {
        const markStr = row[subject.name];
        if (markStr === undefined || markStr === null || markStr.trim() === "") continue;
        
        const marksObtained = parseFloat(markStr);
        if (isNaN(marksObtained)) continue;

        await tx.mark.upsert({
          where: {
            examId_studentId_subject: {
              examId,
              studentId: student.id,
              subject: subject.name
            }
          },
          update: {
            marksObtained,
            maxMarks: parseFloat(subject.maxMarks as string)
          },
          create: {
            examId,
            studentId: student.id,
            subject: subject.name,
            marksObtained,
            maxMarks: parseFloat(subject.maxMarks as string)
          }
        });
      }
    }
  });

  revalidatePath("/exam-setup");
  revalidatePath("/exam-results");
}
