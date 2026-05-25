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
        { grNo: { contains: q, mode: "insensitive" } },
        { mobileNumber: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      grNo: true,
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
    grNo: s.grNo,
    label: `${s.firstName} ${s.lastName} — ${s.standard} ${s.division}`,
    firstName: s.firstName,
    lastName: s.lastName,
    standard: s.standard,
    division: s.division,
  }));

  return NextResponse.json(results);
}
