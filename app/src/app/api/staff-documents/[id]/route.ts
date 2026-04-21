import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFileStream } from "@/lib/minio";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const docId = parseInt(params.id, 10);

  if (isNaN(docId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const doc = await prisma.staffDocument.findUnique({ where: { id: docId } });
  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const stream = await getFileStream(doc.objectKey);
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  const buffer = Buffer.concat(chunks);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": doc.mimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(doc.fileName)}"`,
    },
  });
}
