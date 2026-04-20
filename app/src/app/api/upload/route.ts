import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/minio";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const studentId = formData.get("studentId") as string | null;
  const type = formData.get("type") as string; // "profile" | "document"

  if (!file || !studentId) {
    return NextResponse.json({ error: "Missing file or studentId" }, { status: 400 });
  }

  const id = parseInt(studentId, 10);
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop() || "bin";
  const timestamp = Date.now();

  if (type === "profile") {
    const objectKey = `students/${id}/profile.${ext}`;
    await uploadFile(objectKey, buffer, file.type);
    await prisma.student.update({
      where: { id },
      data: { profilePicture: objectKey },
    });
    return NextResponse.json({ success: true, objectKey });
  }

  // document upload
  const objectKey = `students/${id}/docs/${timestamp}-${file.name}`;
  await uploadFile(objectKey, buffer, file.type);
  await prisma.studentDocument.create({
    data: {
      studentId: id,
      fileName: file.name,
      objectKey,
      mimeType: file.type,
      fileSize: buffer.length,
    },
  });

  return NextResponse.json({ success: true, objectKey });
}
