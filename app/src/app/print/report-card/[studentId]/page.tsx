import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function ReportCardPrintPage(props: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ examId?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const studentId = parseInt(params.studentId, 10);
  const examId = searchParams.examId ? parseInt(searchParams.examId, 10) : null;

  if (isNaN(studentId) || !examId) return notFound();

  const student = await prisma.student.findUnique({
    where: { id: studentId }
  });
  if (!student) return notFound();

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { academicYear: true }
  });
  if (!exam) return notFound();

  const marks = await prisma.mark.findMany({
    where: { studentId: student.id, examId: exam.id },
    orderBy: { subject: 'asc' }
  });

  const subjectsConfig = exam.subjects as Array<{ name: string; maxMarks: string | number }>;
  const PASS_THRESHOLD = 0.35;

  const getGrade = (percentage: number) => {
    if (percentage >= 80) return "A";
    if (percentage >= 60) return "B";
    if (percentage >= 40) return "C";
    if (percentage >= 35) return "D";
    return "F";
  };

  let totalObtained = 0;
  let totalMax = 0;
  let failCount = 0;

  const results = subjectsConfig.map(sc => {
    const markEntry = marks.find(m => m.subject === sc.name);
    const max = typeof sc.maxMarks === 'string' ? parseFloat(sc.maxMarks) : sc.maxMarks;
    const obtained = markEntry ? markEntry.marksObtained : 0;
    const isAbsent = !markEntry;
    
    const percentage = isAbsent ? 0 : (obtained / max) * 100;
    const grade = getGrade(percentage);
    const isFail = percentage < (PASS_THRESHOLD * 100);

    totalMax += max;
    if (!isAbsent) {
      totalObtained += obtained;
      if (isFail) failCount++;
    }

    return {
      subject: sc.name,
      maxMarks: max,
      obtained: isAbsent ? "ABS" : obtained,
      grade: isAbsent ? "-" : grade,
      isFail
    };
  });

  const finalPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  const overallGrade = getGrade(finalPercentage);
  const finalStatus = marks.length === 0 ? "ABSENT" : (failCount > 0 ? "FAILED" : "PASSED");

  return (
    <div className="w-[210mm] min-h-[297mm] mx-auto bg-white p-12 text-slate-900 shadow-xl print:shadow-none print:p-0 print:w-full">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4; margin: 15mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
        }
      `}} />

      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6 mb-8">
        <div className="flex gap-4 items-center">
          <div className="size-20 bg-slate-900 rounded-full border-[1.5px] border-offset-4 border-slate-900 flex items-center justify-center text-white text-3xl font-serif">
            SE
          </div>
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wider text-slate-900">EduManage Academy</h1>
            <p className="text-sm font-medium text-slate-600 mt-0.5">123 Education Lane, Knowledge Park, City - 400001</p>
            <p className="text-sm font-medium text-slate-600">Tel: +91 9876543210 | Email: contact@edumanage.edu</p>
          </div>
        </div>
      </div>

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-800 border-2 py-2 px-8 inline-block border-slate-300 bg-slate-50 font-serif">
          Statement of Marks
        </h2>
        <p className="mt-3 font-semibold text-lg">{exam.name} - {exam.academicYear.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 border-2 border-slate-200 p-6 rounded-lg mb-8 bg-slate-50/50">
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-[120px_1fr]"><span className="font-bold text-slate-500 uppercase">Enrollment No:</span> <span className="font-semibold">{student.enrollmentNo}</span></div>
          <div className="grid grid-cols-[120px_1fr]"><span className="font-bold text-slate-500 uppercase">Student Name:</span> <span className="font-bold text-base">{student.firstName} {student.lastName}</span></div>
          <div className="grid grid-cols-[120px_1fr]"><span className="font-bold text-slate-500 uppercase">Date of Birth:</span> <span className="font-medium">{student.dateOfBirth.toLocaleDateString()}</span></div>
        </div>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-[120px_1fr]"><span className="font-bold text-slate-500 uppercase">Class/Div:</span> <span className="font-semibold">{student.standard} - {student.division}</span></div>
          <div className="grid grid-cols-[120px_1fr]"><span className="font-bold text-slate-500 uppercase">Father's Name:</span> <span className="font-medium">{student.parentName || '--'}</span></div>
          <div className="grid grid-cols-[120px_1fr]"><span className="font-bold text-slate-500 uppercase">Date Issued:</span> <span className="font-medium">{new Date().toLocaleDateString()}</span></div>
        </div>
      </div>

      <table className="w-full border-collapse mb-10">
        <thead>
          <tr className="bg-slate-100 text-slate-800 uppercase tracking-widest text-xs font-bold">
            <th className="border-2 border-slate-300 p-3 text-left w-1/2">Subjects</th>
            <th className="border-2 border-slate-300 p-3 text-center">Max Marks</th>
            <th className="border-2 border-slate-300 p-3 text-center">Marks Obtained</th>
            <th className="border-2 border-slate-300 p-3 text-center">Grade</th>
          </tr>
        </thead>
        <tbody>
          {results.map((row, i) => (
            <tr key={i} className="text-sm font-semibold">
              <td className="border-2 border-slate-300 p-3 text-slate-700">{row.subject}</td>
              <td className="border-2 border-slate-300 p-3 text-center text-slate-500">{row.maxMarks}</td>
              <td className={`border-2 border-slate-300 p-3 text-center ${row.isFail ? 'text-red-600 font-bold' : ''}`}>
                {row.obtained}
              </td>
              <td className={`border-2 border-slate-300 p-3 text-center ${row.isFail ? 'text-red-600 font-bold' : ''}`}>
                {row.grade}
              </td>
            </tr>
          ))}
          <tr className="text-sm bg-slate-50">
            <td className="border-2 border-slate-300 p-3 font-bold text-right uppercase tracking-wider text-slate-700">Grand Total</td>
            <td className="border-2 border-slate-300 p-3 text-center font-bold">{totalMax}</td>
            <td className="border-2 border-slate-300 p-3 text-center font-bold text-lg">{totalObtained}</td>
            <td className="border-2 border-slate-300 p-3 text-center font-bold text-lg">{overallGrade}</td>
          </tr>
        </tbody>
      </table>

      <div className="flex items-center justify-between mb-24">
        <div className="border-2 border-slate-200 rounded p-4 w-64 bg-slate-50/50">
          <p className="text-xs uppercase text-slate-500 font-bold mb-1">Final Result</p>
          <div className="flex items-end gap-3 mt-1">
             <span className="text-3xl font-black tracking-tighter">{finalPercentage.toFixed(2)}<span className="text-xl text-slate-400">%</span></span>
          </div>
          <div className={`mt-3 text-sm font-bold tracking-widest uppercase py-1 text-center rounded border ${
            finalStatus === 'PASSED' ? 'bg-green-100 text-green-800 border-green-200' : 
            finalStatus === 'FAILED' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-orange-100 text-orange-800 border-orange-200'
          }`}>
            {finalStatus}
          </div>
        </div>

        <div className="text-xs border p-3 rounded text-slate-500 space-y-1 bg-white">
          <p className="font-bold text-slate-700 mb-2 border-b pb-1">Grading Scale</p>
          <div className="grid grid-cols-[30px_1fr]"><span className="font-bold">A</span> <span>80% and above</span></div>
           <div className="grid grid-cols-[30px_1fr]"><span className="font-bold">B</span> <span>60% to 79%</span></div>
           <div className="grid grid-cols-[30px_1fr]"><span className="font-bold">C</span> <span>40% to 59%</span></div>
           <div className="grid grid-cols-[30px_1fr]"><span className="font-bold">D</span> <span>35% to 39% (Pass)</span></div>
           <div className="grid grid-cols-[30px_1fr]"><span className="font-bold text-red-600">F</span> <span>Below 35% (Fail)</span></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 mt-auto pt-8">
         <div className="text-center group">
           <div className="h-0 border-t-2 border-slate-400 mx-8"></div>
           <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-2">Class Teacher</p>
         </div>
         <div className="text-center group">
           <div className="h-0 border-t-2 border-slate-400 mx-8"></div>
           <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-2">Parent/Guardian</p>
         </div>
         <div className="text-center group">
           <div className="h-0 border-t-2 border-slate-400 mx-8"></div>
           <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-2">Principal</p>
         </div>
      </div>

      <div className="fixed bottom-6 right-6 flex gap-2 print:hidden bg-white p-3 rounded-xl shadow-lg border">
         <Button className="gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-printer"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>
            Print
         </Button>
      </div>
      
      {/* Script to enable the print button from client side */}
      <script dangerouslySetInnerHTML={{__html: `
         const btn = document.querySelector('button');
         if (btn && btn.textContent.includes('Print')) {
           btn.onclick = () => window.print();
         }
      `}} />
    </div>
  );
}
