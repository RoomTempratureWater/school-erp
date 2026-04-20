import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createExam, parseAndUploadMarks } from "./actions";
import ExamSubjectsInput from "@/components/ExamSubjectsInput";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ExamSetupPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const yearParam = searchParams.year;
  const standardParam = searchParams.standard;
  const divisionParam = searchParams.division;

  const academicYears = await prisma.academicYear.findMany({ orderBy: { createdAt: 'desc' } });

  const allExams = await prisma.exam.findMany({
    include: { academicYear: true },
    orderBy: { createdAt: 'desc' }
  });

  // Unique standards from all exams
  const allStandards = [...new Set(allExams.map(e => e.standard))].sort();

  // Active year filter
  const activeYearId = yearParam ? parseInt(yearParam, 10) : (academicYears.find(a => a.isCurrent)?.id || academicYears[0]?.id || null);

  // Standards available for the selected year
  const standardsForYear = [...new Set(allExams.filter(e => e.academicYearId === activeYearId).map(e => e.standard))].sort();
  const activeStandard = standardParam || null;

  // Fetch unique divisions for the selected standard
  const divisionsRecords = activeStandard ? await prisma.student.findMany({
    where: { standard: activeStandard },
    select: { division: true },
    distinct: ['division']
  }) : [];
  const divisions = divisionsRecords.map(d => d.division).sort();

  // Filter exams
  let filteredExams = allExams.filter(e => activeYearId ? e.academicYearId === activeYearId : true);
  if (activeStandard) filteredExams = filteredExams.filter(e => e.standard === activeStandard);

  // To let user download per division, we can fetch unique divisions across students or just use a generic list.
  // For simplicity, let's fetch unique divisions for the standards that have exams.
  const allDivisionsRecords = await prisma.student.findMany({
    select: { standard: true, division: true },
    distinct: ['standard', 'division']
  });

  const getDivisionsForStandard = (std: string) => {
    return allDivisionsRecords.filter(d => d.standard === std).map(d => d.division).sort();
  };

  async function filterExamsAction(formData: FormData) {
    "use server";
    const yr = formData.get("filterYear") as string;
    const std = formData.get("filterStandard") as string;
    const div = formData.get("filterDivision") as string;

    const params = new URLSearchParams();
    if (yr) params.set("year", yr);
    if (std) params.set("standard", std);
    if (div) params.set("division", div);

    redirect(`/exam-setup?${params.toString()}`);
  }

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 w-full">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Examination Setup</h1>
          <p className="text-muted-foreground mt-1 text-sm">Define exams, setup subjects, and manage offline data entry via CSV.</p>
        </div>

        <div className="grid gap-8 xl:grid-cols-3 items-start">
          
          <div className="xl:col-span-1 space-y-8">
             <Card className="shadow-sm sticky top-24">
                <CardHeader>
                   <CardTitle>Create New Exam</CardTitle>
                   <CardDescription>Setup an exam block for a specific standard.</CardDescription>
                </CardHeader>
                <CardContent>
                   <form action={createExam} className="space-y-4">
                      <div className="space-y-1">
                         <label className="text-xs font-medium text-foreground">Exam Name</label>
                         <Input name="name" placeholder="E.g. Mid Term Examination" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-foreground">Academic Year</label>
                          <select name="academicYearId" required className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                             {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                           <label className="text-xs font-medium text-foreground">Exam Date</label>
                           <Input type="date" name="examDate" className="bg-white" />
                        </div>
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs font-medium text-foreground">Standard (Class)</label>
                         <Input name="standard" placeholder="E.g. 10" required className="bg-white" />
                      </div>

                      <div className="border-t pt-4 mt-6">
                        <h4 className="text-sm font-semibold mb-3">Subjects</h4>
                        <ExamSubjectsInput />
                      </div>

                      <Button type="submit" className="w-full mt-4">Create Exam</Button>
                   </form>
                </CardContent>
             </Card>
          </div>

          <div className="xl:col-span-2 space-y-8">
             <Card className="shadow-sm">
                <CardHeader>
                   <CardTitle>Manage Exams & Marks Entry</CardTitle>
                   <CardDescription>Filter, download templates, and upload marks per section.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   {/* Filter bar */}
                   <div className="bg-slate-50 border rounded-lg p-4">
                     <form action={filterExamsAction} className="flex flex-wrap gap-4 items-end">
                       <div className="space-y-1 sm:w-36">
                         <label className="text-xs font-medium text-muted-foreground">School Year</label>
                         <select name="filterYear" defaultValue={activeYearId || ""} className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                           <option value="">All Years</option>
                           {academicYears.map(ay => (
                             <option key={ay.id} value={ay.id}>{ay.name}</option>
                           ))}
                         </select>
                       </div>
                       <div className="space-y-1 sm:w-28">
                         <label className="text-xs font-medium text-muted-foreground">Standard</label>
                         <select name="filterStandard" defaultValue={activeStandard || ""} className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                           <option value="">All</option>
                           {allStandards.map(s => (
                             <option key={s} value={s}>{s}</option>
                           ))}
                         </select>
                       </div>
                       <div className="flex gap-2">
                         <Button type="submit" size="sm" className="h-9">Filter</Button>
                         <Link href="/exam-setup" className="items-center flex justify-center bg-white text-muted-foreground hover:bg-slate-100 border rounded-md text-sm font-medium px-3 h-9">Reset</Link>
                       </div>
                     </form>
                   </div>

                   {/* Exam list */}
                   <div className="space-y-6">
                     {filteredExams.length === 0 ? (
                       <p className="text-center py-8 text-muted-foreground text-sm border rounded-md border-dashed">No exams found for the selected filters.</p>
                     ) : (
                       filteredExams.map(exam => {
                         const standardDivisions = getDivisionsForStandard(exam.standard);
                         return (
                           <div key={exam.id} className="border rounded-lg p-4 bg-white shadow-sm">
                             <div className="flex justify-between items-start mb-4">
                               <div>
                                 <h3 className="font-bold text-lg text-primary">{exam.name} <span className="text-muted-foreground text-sm font-normal">({exam.academicYear.name})</span></h3>
                                 <p className="text-sm text-muted-foreground">Standard: <span className="font-semibold text-foreground">{exam.standard}</span> &bull; {exam.examDate ? exam.examDate.toLocaleDateString() : 'No date set'}</p>
                                 <div className="mt-2 flex gap-1 flex-wrap">
                                   {(exam.subjects as any[]).map((s, i) => (
                                     <span key={i} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-muted-foreground border">
                                       {s.name} (Max {s.maxMarks})
                                     </span>
                                   ))}
                                 </div>
                               </div>
                             </div>

                             <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                <div>
                                  <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">1. Download Template</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {standardDivisions.length > 0 ? standardDivisions.map(div => (
                                      <a key={div} href={`/api/exams/csv?examId=${exam.id}&division=${div}`} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded-md font-medium transition-colors">
                                        Download Div {div}
                                      </a>
                                    )) : <span className="text-xs text-muted-foreground italic">No Active Students in Standard {exam.standard}</span>}
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">2. Upload Marks</h4>
                                  <form action={parseAndUploadMarks} className="flex gap-2">
                                    <input type="hidden" name="examId" value={exam.id} />
                                    <Input type="file" name="file" accept=".csv" required className="h-8 text-xs file:h-full file:bg-transparent file:text-xs" />
                                    <Button type="submit" size="sm" className="h-8 text-xs">Upload</Button>
                                  </form>
                                </div>
                             </div>
                           </div>
                         );
                       })
                     )}
                   </div>
                </CardContent>
             </Card>
          </div>

        </div>
      </div>
    </main>
  );
}
