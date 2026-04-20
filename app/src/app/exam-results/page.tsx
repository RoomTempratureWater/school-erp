import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";

export default async function ExamResultsPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const yearParam = searchParams.year;
  const standardParam = searchParams.standard;
  const examIdParam = searchParams.examId;
  const divisionParam = searchParams.division;
  const search = searchParams.q;

  // Fetch academic years
  const academicYears = await prisma.academicYear.findMany({ orderBy: { createdAt: 'desc' } });

  // Fetch all exams with academic year
  const allExams = await prisma.exam.findMany({ include: { academicYear: true }, orderBy: { createdAt: 'desc' } });

  if (allExams.length === 0) {
    return (
      <main className="flex-1 p-6 md:p-8 bg-slate-50 w-full">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Exam Results</h1>
        <p className="text-muted-foreground">No exams found. Please create an exam in the Setup tab first.</p>
      </main>
    );
  }

  // Determine unique standards from exams
  const allStandards = [...new Set(allExams.map(e => e.standard))].sort();

  // Determine active year
  const activeYearId = yearParam ? parseInt(yearParam, 10) : (academicYears.find(a => a.isCurrent)?.id || academicYears[0]?.id);
  const activeYear = academicYears.find(a => a.id === activeYearId);

  // Standards available for the selected year
  const standardsForYear = [...new Set(allExams.filter(e => e.academicYearId === activeYearId).map(e => e.standard))].sort();
  const activeStandard = standardParam && standardsForYear.includes(standardParam) ? standardParam : (standardsForYear[0] || null);

  // Exams filtered by year + standard
  const filteredExams = allExams.filter(e => e.academicYearId === activeYearId && (activeStandard ? e.standard === activeStandard : true));

  // Active exam
  const activeExamId = examIdParam ? parseInt(examIdParam, 10) : (filteredExams[0]?.id || null);
  const activeExam = filteredExams.find(e => e.id === activeExamId) || filteredExams[0] || null;

  // Fetch unique divisions for the active standard
  const divisionsRecords = activeStandard ? await prisma.student.findMany({
    where: { standard: activeStandard },
    select: { division: true },
    distinct: ['division']
  }) : [];
  const divisions = divisionsRecords.map(d => d.division).sort();

  // Fetch students with marks for active exam
  let studentsWithMarks: any[] = [];
  let subjects: Array<{ name: string; maxMarks: number | string }> = [];
  const PASS_THRESHOLD = 0.35; // 35% to pass

  if (activeExam) {
    const studentWhere: any = {
      standard: activeExam.standard
    };
    if (divisionParam) studentWhere.division = divisionParam;
    if (search) {
      studentWhere.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { enrollmentNo: { contains: search, mode: 'insensitive' } }
      ];
    }

    studentsWithMarks = await prisma.student.findMany({
      where: studentWhere,
      include: {
        marks: {
          where: { examId: activeExam.id }
        }
      },
      orderBy: { enrollmentNo: 'asc' }
    });

    subjects = activeExam.subjects as Array<{ name: string; maxMarks: number | string }>;
  }

  async function filterAction(formData: FormData) {
    "use server";
    const yr = formData.get("year") as string;
    const std = formData.get("standard") as string;
    const eId = formData.get("examId") as string;
    const div = formData.get("division") as string;
    const q = formData.get("q") as string;
    
    const params = new URLSearchParams();
    if (yr) params.set("year", yr);
    if (std) params.set("standard", std);
    if (eId) params.set("examId", eId);
    if (div) params.set("division", div);
    if (q) params.set("q", q);
    
    redirect(`/exam-results?${params.toString()}`);
  }

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 w-full">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Results</h1>
          <p className="text-muted-foreground mt-1 text-sm">View student performance and generate report cards.</p>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm mb-6">
          <form action={filterAction} className="flex flex-wrap gap-4 items-end w-full">
            <div className="space-y-1 sm:w-36">
              <label className="text-xs font-medium text-muted-foreground">School Year</label>
              <select name="year" defaultValue={activeYearId || ""} className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                {academicYears.map(ay => (
                  <option key={ay.id} value={ay.id}>{ay.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1 sm:w-28">
              <label className="text-xs font-medium text-muted-foreground">Standard</label>
              <select name="standard" defaultValue={activeStandard || ""} className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                {standardsForYear.length === 0 && <option value="">No exams</option>}
                {standardsForYear.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1 sm:w-40">
              <label className="text-xs font-medium text-muted-foreground">Select Exam</label>
              <select name="examId" defaultValue={activeExamId || ""} className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                {filteredExams.length === 0 && <option value="">No exams</option>}
                {filteredExams.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1 sm:w-28">
              <label className="text-xs font-medium text-muted-foreground">Division</label>
              <select name="division" defaultValue={divisionParam || ""} className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">All Divs</option>
                {divisions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1 flex-1 min-w-[140px]">
              <label className="text-xs font-medium text-muted-foreground">Search Student</label>
              <Input name="q" placeholder="Name or Enrollment No" defaultValue={search} />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button type="submit">Filter</Button>
              <Link href="/exam-results" className="items-center flex justify-center bg-muted text-muted-foreground hover:bg-slate-200 border rounded-md text-sm font-medium px-4 h-9">Reset</Link>
            </div>
          </form>
        </div>

        {!activeExam ? (
          <div className="bg-white border rounded-lg p-8 shadow-sm text-center text-muted-foreground">
            No exams found for the selected criteria. Try changing the school year or standard.
          </div>
        ) : (
        <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
             <Table>
               <TableHeader className="bg-slate-50/80">
                 <TableRow>
                   <TableHead>Enrollment No</TableHead>
                   <TableHead>Student Name</TableHead>
                   <TableHead>Class</TableHead>
                   <TableHead>Total Marks</TableHead>
                   <TableHead>Percentage</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead className="text-center">Report Card</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {studentsWithMarks.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No students found for this filter criteria.</TableCell>
                   </TableRow>
                 ) : (
                   studentsWithMarks.map(student => {
                     // Evaluate marks
                     let totalObtained = 0;
                     let totalMax = 0;
                     let hasFailedSubject = false;
                     
                     student.marks.forEach((m: any) => {
                       totalObtained += m.marksObtained;
                       totalMax += m.maxMarks;
                       if (m.marksObtained < (m.maxMarks * PASS_THRESHOLD)) {
                         hasFailedSubject = true;
                       }
                     });

                     const missingMarks = student.marks.length < subjects.length;
                     const isFail = hasFailedSubject;
                     const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
                     
                     return (
                       <TableRow key={student.id} className="hover:bg-slate-50/50">
                          <TableCell className="font-medium text-muted-foreground text-xs">{student.enrollmentNo}</TableCell>
                          <TableCell className="font-semibold">{student.firstName} {student.lastName}</TableCell>
                          <TableCell>{student.standard}-{student.division}</TableCell>
                          <TableCell>
                            {student.marks.length > 0 ? (
                               <span className="font-medium">{totalObtained} <span className="text-muted-foreground font-normal text-xs">/ {totalMax}</span></span>
                            ) : <span className="text-muted-foreground italic text-xs">Pending Data</span>}
                          </TableCell>
                          <TableCell>
                             {student.marks.length > 0 ? (
                                <span className="font-mono">{percentage.toFixed(1)}%</span>
                             ) : '-'}
                          </TableCell>
                          <TableCell>
                             {student.marks.length === 0 ? (
                                <span className="text-xs border px-2 py-0.5 rounded text-orange-600 bg-orange-50 border-orange-100">No Marks</span>
                             ) : missingMarks ? (
                                <span className="text-xs border px-2 py-0.5 rounded text-gray-600 bg-gray-50 border-gray-200">Incomplete</span>
                             ) : isFail ? (
                                <span className="text-xs border px-2 py-0.5 rounded text-red-600 bg-red-50 border-red-100 font-bold tracking-wider">FAIL</span>
                             ) : (
                                <span className="text-xs border px-2 py-0.5 rounded text-green-700 bg-green-50 border-green-200 font-bold tracking-wider">PASS</span>
                             )}
                          </TableCell>
                          <TableCell className="text-center">
                             <Link href={`/print/report-card/${student.id}?examId=${activeExam.id}`} target="_blank">
                                <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/5 border border-primary/10">View Report</Button>
                             </Link>
                          </TableCell>
                       </TableRow>
                     )
                   })
                 )}
               </TableBody>
             </Table>
          </div>
        </div>
        )}
      </div>
    </main>
  );
}
