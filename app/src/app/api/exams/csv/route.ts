import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import papaparse from "papaparse";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const examId = searchParams.get("examId");
  const division = searchParams.get("division");

  if (!examId || !division) {
    return new NextResponse("Missing examId or division", { status: 400 });
  }

  const exam = await prisma.exam.findUnique({ where: { id: parseInt(examId, 10) } });
  if (!exam) {
    return new NextResponse("Exam not found", { status: 404 });
  }

  const students = await prisma.student.findMany({
    where: {
      standard: exam.standard,
      division: division,
      status: "ACTIVE"
    },
    orderBy: { grNo: 'asc' }
  });

  const subjects = exam.subjects as Array<{ name: string; maxMarks: string | number }>;
  const subjectHeaders = subjects.map(s => s.name);

  const data = students.map(student => {
    const row: any = {
      GrNo: student.grNo,
      FirstName: student.firstName,
      LastName: student.lastName,
    };
    subjectHeaders.forEach(s => row[s] = "");
    return row;
  });

  const csv = papaparse.unparse(data);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${exam.name}_Std${exam.standard}_Div${division}.csv"`,
    }
  });
}
