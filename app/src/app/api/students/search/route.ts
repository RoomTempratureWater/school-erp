import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";

  if (q.length < 1) {
    return NextResponse.json([]);
  }

  const students = await prisma.student.findMany({
    where: {
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { enrollmentNo: { contains: q, mode: "insensitive" } },
        { contactNumber: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      enrollmentNo: true,
      firstName: true,
      lastName: true,
      standard: true,
      division: true,
    },
    orderBy: { firstName: "asc" },
    take: 20,
  });

  const results = students.map((s) => ({
    id: s.id,
    enrollmentNo: s.enrollmentNo,
    label: `${s.firstName} ${s.lastName} — ${s.standard} ${s.division}`,
    firstName: s.firstName,
    lastName: s.lastName,
    standard: s.standard,
    division: s.division,
  }));

  return NextResponse.json(results);
}
