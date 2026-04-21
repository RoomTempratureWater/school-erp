import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/minio";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const staffId = formData.get("staffId") as string | null;
  const type = formData.get("type") as string; // "profile" | "document"

  if (!file || !staffId) {
    return NextResponse.json({ error: "Missing file or staffId" }, { status: 400 });
  }

  const id = parseInt(staffId, 10);
  const staff = await prisma.staff.findUnique({ where: { id } });
  if (!staff) {
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop() || "bin";
  const timestamp = Date.now();

  if (type === "profile") {
    const objectKey = `staff/${id}/profile.${ext}`;
    await uploadFile(objectKey, buffer, file.type);
    await prisma.staff.update({
      where: { id },
      data: { profilePicture: objectKey },
    });
    return NextResponse.json({ success: true, objectKey });
  }

  // document upload
  const objectKey = `staff/${id}/docs/${timestamp}-${file.name}`;
  await uploadFile(objectKey, buffer, file.type);
  await prisma.staffDocument.create({
    data: {
      staffId: id,
      fileName: file.name,
      objectKey,
      mimeType: file.type,
      fileSize: buffer.length,
    },
  });

  return NextResponse.json({ success: true, objectKey });
}
