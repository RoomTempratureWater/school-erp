import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function PrintAdmissionReceipt(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const idStr = params.id;
  const id = parseInt(idStr, 10);
  
  if (isNaN(id)) return notFound();

  const student = await prisma.student.findUnique({
    where: { id },
  });

  if (!student) return notFound();

  return (
    <div className="bg-white min-h-screen text-black font-sans p-12 max-w-4xl mx-auto print:p-0 print:m-0">
      
      <div className="flex items-center justify-between border-b pb-6 mb-8">
         <div className="flex items-center gap-3">
             <div className="size-12 rounded-md bg-stone-900 text-white flex flex-col items-center justify-center font-bold text-xl print:bg-stone-900 print:text-white">E</div>
             <div>
                <h1 className="text-2xl font-bold uppercase tracking-widest">EduManage</h1>
                <p className="text-sm text-stone-500 uppercase tracking-widest">Admission Receipt</p>
             </div>
         </div>
         <div className="text-right">
             <p className="text-sm font-semibold">Date of Issue</p>
             <p className="text-sm text-stone-600">{new Date().toLocaleDateString()}</p>
         </div>
      </div>

      <div className="space-y-8">
         <div>
            <h2 className="text-xl font-bold mb-4 bg-stone-100 p-2 print:bg-stone-100">Student Particulars</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 px-2">
               <div>
                 <p className="text-xs text-stone-500 uppercase font-semibold">GR number</p>
                 <p className="text-lg font-bold">{student.grNo}</p>
               </div>
               <div>
                 <p className="text-xs text-stone-500 uppercase font-semibold">Full Name</p>
                 <p className="text-lg font-bold">{student.lastName.toUpperCase()}, {student.firstName}</p>
               </div>
               <div>
                 <p className="text-xs text-stone-500 uppercase font-semibold">Standard & Division</p>
                 <p className="text-base">{student.standard} - {student.division}</p>
               </div>
               <div>
                 <p className="text-xs text-stone-500 uppercase font-semibold">Date of Birth</p>
                 <p className="text-base">{new Date(student.dateOfBirth).toLocaleDateString()}</p>
               </div>
            </div>
         </div>

         <div>
            <h2 className="text-xl font-bold mb-4 bg-stone-100 p-2 print:bg-stone-100">Contact Details</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 px-2">
               <div>
                 <p className="text-xs text-stone-500 uppercase font-semibold">Parent / Guardian</p>
                 <p className="text-base">{student.fatherName || "Not Provided"}</p>
               </div>
               <div>
                 <p className="text-xs text-stone-500 uppercase font-semibold">Primary Contact</p>
                 <p className="text-base">{student.mobileNumber || "Not Provided"}</p>
               </div>
               <div>
                 <p className="text-xs text-stone-500 uppercase font-semibold">Admission Date</p>
                 <p className="text-base">{student.createdAt.toLocaleDateString()}</p>
               </div>
            </div>
         </div>
         
         <div className="mt-16 text-center text-sm text-stone-500 border-t pt-8">
            <p>This is a system generated document mapped directly to database variables.</p>
            <p>Any alterations render this receipt invalid.</p>
         </div>
         
      </div>

      {/* Auto-Trigger Print Dialog */}
      <script dangerouslySetInnerHTML={{
        __html: `window.onload = function() { window.print(); }`
      }} />

    </div>
  );
}
