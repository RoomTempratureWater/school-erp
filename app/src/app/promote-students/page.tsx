import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { redirect } from "next/navigation";
import PromotionTable from "./PromotionTable";
import { Sparkles } from "lucide-react";

export default async function PromoteStudentsPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const yearParam = searchParams.year;
  const standardParam = searchParams.standard;
  const divisionParam = searchParams.division;
  const q = searchParams.q;

  // Fetch academic years
  const academicYears = await prisma.academicYear.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Determine active year
  const activeYearId = yearParam
    ? parseInt(yearParam, 10)
    : academicYears.find((a) => a.isCurrent)?.id || academicYears[0]?.id;
  
  const activeYear = academicYears.find((a) => a.id === activeYearId);

  // Fetch all unique standards and divisions from students for filters
  const [standardsRaw, divisionsRaw] = await Promise.all([
    prisma.student.findMany({ select: { standard: true }, distinct: ["standard"] }),
    prisma.student.findMany({ select: { division: true }, distinct: ["division"] }),
  ]);

  const allStandards = standardsRaw.map((s) => s.standard).sort();
  const allDivisions = divisionsRaw.map((d) => d.division).sort();

  const activeStandard = standardParam || allStandards[0] || "";

  // Fetch students with their marks for the "latest exam" in the selected year/standard
  // We'll look for the most recent exam for this year + standard
  const latestExam = await prisma.exam.findFirst({
    where: {
      academicYearId: activeYearId,
      standard: activeStandard,
    },
    orderBy: { createdAt: "desc" },
  });

  const PASS_THRESHOLD = 0.35; // 35%

  const studentWhere: any = {
    standard: activeStandard,
  };
  if (divisionParam) studentWhere.division = divisionParam;
  if (q) {
    studentWhere.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { enrollmentNo: { contains: q, mode: "insensitive" } },
    ];
  }

  const students = await prisma.student.findMany({
    where: studentWhere,
    include: {
      marks: latestExam ? { where: { examId: latestExam.id } } : false,
    },
    orderBy: { enrollmentNo: "asc" },
  });

  // Calculate exam context for the table
  const studentsWithContext = students.map((s) => {
    let totalObtained = 0;
    let totalMax = 0;
    let hasFailed = false;

    if (s.marks && s.marks.length > 0) {
      s.marks.forEach((m) => {
        totalObtained += m.marksObtained;
        totalMax += m.maxMarks;
        if (m.marksObtained < m.maxMarks * PASS_THRESHOLD) hasFailed = true;
      });
    }

    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : undefined;

    return {
      id: s.id,
      enrollmentNo: s.enrollmentNo,
      firstName: s.firstName,
      lastName: s.lastName,
      standard: s.standard,
      division: s.division,
      totalMarks: totalMax > 0 ? totalObtained : undefined,
      maxMarks: totalMax > 0 ? totalMax : undefined,
      percentage,
      isFail: hasFailed,
    };
  });

  async function filterAction(formData: FormData) {
    "use server";
    const yr = formData.get("year");
    const std = formData.get("standard");
    const div = formData.get("division");
    const search = formData.get("q");

    const params = new URLSearchParams();
    if (yr) params.set("year", yr as string);
    if (std) params.set("standard", std as string);
    if (div) params.set("division", div as string);
    if (search) params.set("q", search as string);

    redirect(`/promote-students?${params.toString()}`);
  }

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-10 w-full">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Sparkles className="size-5 text-primary" />
              </div>
              <span className="text-sm font-bold text-primary tracking-widest uppercase">Academic Excellence</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Student Promotions</h1>
            <p className="text-slate-500 mt-2 text-lg">Manage mass promotions, section changes and track student progression history.</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border rounded-2xl p-6 shadow-xl shadow-slate-200/50">
          <form action={filterAction} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Academic Year</label>
              <select name="year" defaultValue={activeYearId || ""} className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition-all focus:bg-white focus:ring-2 focus:ring-primary/20">
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>{ay.name} {ay.isCurrent ? "(Current)" : ""}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Current Standard</label>
              <select name="standard" defaultValue={activeStandard} className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition-all focus:bg-white focus:ring-2 focus:ring-primary/20">
                {allStandards.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Division</label>
              <select name="division" defaultValue={divisionParam || ""} className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition-all focus:bg-white focus:ring-2 focus:ring-primary/20">
                <option value="">All Divisions</option>
                {allDivisions.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Search Students</label>
              <Input name="q" placeholder="Name or Enrollment..." defaultValue={q} className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white" />
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="h-11 flex-1 rounded-xl shadow-md hover:shadow-lg transition-all">Apply Filter</Button>
              <Link href="/promote-students" className="h-11 px-4 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all font-medium">Reset</Link>
            </div>
          </form>
        </div>

        {/* Promotion Table */}
        <PromotionTable 
          students={studentsWithContext} 
          academicYearId={activeYearId!} 
          allStandards={allStandards}
          allDivisions={allDivisions}
        />
      </div>
    </main>
  );
}
