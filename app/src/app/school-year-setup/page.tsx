import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createAcademicYear, createFeeCategory } from "./actions";
import Link from "next/link";

export default async function SchoolYearSetupPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const filterYearId = searchParams.yearId;

  const academicYears = await prisma.academicYear.findMany({ orderBy: { createdAt: 'desc' } });
  const currentYear = academicYears.find(ay => ay.isCurrent) || academicYears[0] || null;

  // Default to current year for filtering templates
  const activeFilterId = filterYearId ? parseInt(filterYearId, 10) : (currentYear?.id || null);

  const feeCategories = await prisma.feeCategory.findMany({ 
    where: activeFilterId ? { academicYearId: activeFilterId } : undefined,
    include: { academicYear: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 w-full">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">School Year Setup</h1>
          <p className="text-muted-foreground mt-1 text-sm">Configure academic years and global fee structures.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 items-start">
          
          <div className="space-y-8">
             <Card className="shadow-sm">
                <CardHeader>
                   <CardTitle>Add Academic Year</CardTitle>
                   <CardDescription>Define a new school year block (e.g. 2025-26).</CardDescription>
                </CardHeader>
                <CardContent>
                   <form action={createAcademicYear} className="space-y-4">
                      <div className="space-y-1">
                         <label className="text-xs font-medium text-foreground">Year Label</label>
                         <Input name="name" placeholder="2025-26" required />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                         <input type="checkbox" name="isCurrent" id="isCurrent" className="rounded border-gray-300" />
                         <label htmlFor="isCurrent" className="text-sm font-medium text-foreground">Set as Current Year</label>
                      </div>
                      <Button type="submit" className="w-full">Create Year</Button>
                   </form>

                   <div className="mt-8 border-t pt-4">
                     <h3 className="text-sm font-semibold mb-2 text-foreground">Existing Years</h3>
                     <Table>
                       <TableHeader>
                         <TableRow>
                           <TableHead>Label</TableHead>
                           <TableHead>Current</TableHead>
                         </TableRow>
                       </TableHeader>
                       <TableBody>
                         {academicYears.map(ay => (
                           <TableRow key={ay.id}>
                             <TableCell className="font-medium">{ay.name}</TableCell>
                             <TableCell>{ay.isCurrent ? "Yes" : "No"}</TableCell>
                           </TableRow>
                         ))}
                       </TableBody>
                     </Table>
                   </div>
                </CardContent>
             </Card>
          </div>

          <div className="space-y-8">
             <Card className="shadow-sm bg-primary/5 border-primary/20">
                <CardHeader>
                   <CardTitle>Fee Configuration</CardTitle>
                   <CardDescription>Assign fees mapped directly to a specific year.</CardDescription>
                </CardHeader>
                <CardContent>
                   <form action={createFeeCategory} className="space-y-4">
                      <div className="space-y-1">
                         <label className="text-xs font-medium text-foreground">Fee Name</label>
                         <Input name="name" placeholder="E.g. Computer Fee" required />
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs font-medium text-foreground">Amount (INR)</label>
                         <Input name="amount" type="number" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                           <label className="text-xs font-medium text-foreground">Academic Year</label>
                           <select name="academicYearId" required className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                              {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.name}</option>)}
                           </select>
                         </div>
                         <div className="space-y-1">
                           <label className="text-xs font-medium text-foreground">Standard</label>
                           <Input name="standard" placeholder="Optional" className="bg-white" />
                         </div>
                      </div>
                      <Button type="submit" variant="secondary" className="w-full mt-2 border border-primary/20">Create Fee Template</Button>
                   </form>

                   <div className="mt-8 border-t border-primary/10 pt-4">
                     <div className="flex items-center justify-between mb-3">
                       <h3 className="text-sm font-semibold text-foreground">Configured Templates</h3>
                       <div className="flex items-center gap-2">
                         {academicYears.map(ay => {
                           const isActive = activeFilterId === ay.id;
                           const params = new URLSearchParams();
                           params.set("yearId", String(ay.id));
                           return (
                             <Link
                               key={ay.id}
                               href={`/school-year-setup?${params.toString()}`}
                               className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-colors ${
                                 isActive
                                   ? "bg-primary text-primary-foreground border-primary"
                                   : "bg-white text-muted-foreground border-input hover:bg-slate-50 hover:text-foreground"
                               }`}
                             >
                               {ay.name}
                             </Link>
                           );
                         })}
                         {activeFilterId && (
                           <Link
                             href="/school-year-setup"
                             className="text-[11px] px-2.5 py-1 rounded-full border bg-white text-muted-foreground border-input hover:bg-slate-50 hover:text-foreground font-medium transition-colors"
                           >
                             All
                           </Link>
                         )}
                       </div>
                     </div>
                     <Table>
                       <TableHeader>
                         <TableRow>
                           <TableHead>Name</TableHead>
                           <TableHead>Year</TableHead>
                           <TableHead className="text-right">Amount</TableHead>
                         </TableRow>
                       </TableHeader>
                       <TableBody>
                         {feeCategories.length === 0 ? (
                           <TableRow>
                             <TableCell colSpan={3} className="text-center py-6 text-muted-foreground text-sm">No fee templates found for this year.</TableCell>
                           </TableRow>
                         ) : (
                           feeCategories.map(fc => (
                             <TableRow key={fc.id}>
                               <TableCell className="font-medium text-muted-foreground">{fc.name} <span className="text-xs">{(fc.standard ? `(Std: ${fc.standard})` : '')}</span></TableCell>
                               <TableCell>
                                 <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                                   {fc.academicYear.name}
                                 </span>
                               </TableCell>
                               <TableCell className="text-right font-semibold">{fc.amount.toLocaleString()}</TableCell>
                             </TableRow>
                           ))
                         )}
                       </TableBody>
                     </Table>
                   </div>
                </CardContent>
             </Card>
          </div>

        </div>
      </div>
    </main>
  );
}
