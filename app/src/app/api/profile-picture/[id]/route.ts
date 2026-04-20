import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFileStream } from "@/lib/minio";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const studentId = parseInt(params.id, 10);

  if (isNaN(studentId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student || !student.profilePicture) {
    return NextResponse.json({ error: "No profile picture" }, { status: 404 });
  }

  const stream = await getFileStream(student.profilePicture);
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  const buffer = Buffer.concat(chunks);

  const ext = student.profilePicture.split(".").pop() || "jpg";
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    gif: "image/gif", webp: "image/webp",
  };

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mimeMap[ext] || "image/jpeg",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
