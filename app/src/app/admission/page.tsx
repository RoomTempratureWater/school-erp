import { prisma } from "@/lib/prisma";
import DownloadCSV from "@/components/DownloadCSV";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";
import { addStudent, filterAdmissions } from "./actions";

export default async function AdmissionPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const search = searchParams.search;
  const standard = searchParams.standard;
  const division = searchParams.division;

  const students = await prisma.student.findMany({
    where: {
      OR: search ? [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { grNo: { contains: search, mode: 'insensitive' } },
      ] : undefined,
      standard: standard ? standard : undefined,
      division: division ? division : undefined,
    },
    orderBy: { createdAt: 'desc' }
  });

  async function searchAction(formData: FormData) {
    "use server";
    const queryString = await filterAdmissions(formData);
    redirect(`/admission?${queryString}`);
  }

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 w-full print:bg-white print:p-0">
      <div className="mx-auto max-w-7xl space-y-8 print:m-0 print:max-w-none print:space-y-0">
        
        {/* Header */}
        <div className="print:hidden">
          <h1 className="text-3xl font-bold tracking-tight">Admissions</h1>
          <p className="text-muted-foreground mt-1 text-sm">Register new students and review admission history.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 items-start print:block">
          
          {/* Form Column */}
          <div className="lg:col-span-1 print:hidden">
             <Card className="shadow-sm sticky top-24">
                <CardHeader>
                   <CardTitle>New Admission</CardTitle>
                   <CardDescription>Enter the student details to register.</CardDescription>
                </CardHeader>
                <CardContent>
                   <form action={addStudent} className="space-y-4">
                      <div className="space-y-1">
                         <label className="text-xs font-medium text-foreground">GR No.</label>
                         <Input name="grNo" placeholder="E.g. GR-2024-001" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                           <label className="text-xs font-medium text-foreground">First Name</label>
                           <Input name="firstName" required />
                         </div>
                         <div className="space-y-1">
                           <label className="text-xs font-medium text-foreground">Last Name</label>
                           <Input name="lastName" required />
                         </div>
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs font-medium text-foreground">Date of Birth</label>
                         <Input name="dateOfBirth" type="date" required />
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs font-medium text-foreground">Date of Admission</label>
                         <Input name="dateOfAdmission" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                           <label className="text-xs font-medium text-foreground">Standard</label>
                           <Input name="standard" placeholder="E.g. 10" required />
                         </div>
                         <div className="space-y-1">
                           <label className="text-xs font-medium text-foreground">Division</label>
                           <Input name="division" placeholder="E.g. A" required />
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                           <label className="text-xs font-medium text-foreground">Aadhar No.</label>
                           <Input name="aadharNo" />
                         </div>
                         <div className="space-y-1">
                           <label className="text-xs font-medium text-foreground">State Code</label>
                           <Input name="stateCode" />
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                           <label className="text-xs font-medium text-foreground">PEN No</label>
                           <Input name="penNo" />
                         </div>
                         <div className="space-y-1">
                           <label className="text-xs font-medium text-foreground">Appar ID</label>
                           <Input name="apparId" />
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                           <label className="text-xs font-medium text-foreground">Blood Group</label>
                           <Input name="bloodGroup" />
                         </div>
                         <div className="space-y-1">
                           <label className="text-xs font-medium text-foreground">Mother Tongue</label>
                           <Input name="motherTongue" />
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                           <label className="text-xs font-medium text-foreground">Religion</label>
                           <Input name="religion" />
                         </div>
                         <div className="space-y-1">
                           <label className="text-xs font-medium text-foreground">Caste / Category</label>
                           <Input name="caste" placeholder="Caste" />
                           <Input name="category" placeholder="Category" className="mt-1" />
                         </div>
                      </div>

                      <div className="space-y-1">
                         <label className="text-xs font-medium text-foreground">Birth Place (City, State)</label>
                         <div className="grid grid-cols-2 gap-2">
                           <Input name="birthCity" placeholder="City" />
                           <Input name="birthState" placeholder="State" />
                         </div>
                      </div>

                      <div className="space-y-1">
                         <label className="text-xs font-medium text-foreground">Current Address</label>
                         <Input name="currentAddress" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                           <label className="text-xs font-medium text-foreground">Father's Name</label>
                           <Input name="fatherName" />
                         </div>
                         <div className="space-y-1">
                           <label className="text-xs font-medium text-foreground">Mother's Name</label>
                           <Input name="motherName" />
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                           <label className="text-xs font-medium text-foreground">Mobile Number</label>
                           <Input name="mobileNumber" />
                         </div>
                         <div className="space-y-1">
                           <label className="text-xs font-medium text-foreground">Contact Email</label>
                           <Input name="contactEmail" type="email" />
                         </div>
                      </div>
                      <Button type="submit" className="w-full mt-2">Submit Registration</Button>
                   </form>
                </CardContent>
             </Card>
          </div>

          {/* History Column */}
          <div className="col-span-1 lg:col-span-2 space-y-6 print:hidden">
             <div className="flex flex-col xl:flex-row border rounded-lg p-4 bg-card shadow-sm xl:items-center justify-between gap-4">
                <form action={searchAction} className="flex flex-wrap lg:flex-nowrap gap-4 items-end w-full lg:max-w-2xl">
                   <div className="space-y-1 flex-1 w-full min-w-[200px]">
                     <label className="text-xs font-medium text-muted-foreground">Search</label>
                     <Input name="q" placeholder="Search..." defaultValue={search} className="bg-white" />
                   </div>
                   <div className="space-y-1 w-full lg:w-24 shrink-0">
                     <label className="text-xs font-medium text-muted-foreground">Standard</label>
                     <Input name="standard" defaultValue={standard} className="bg-white" />
                   </div>
                   <div className="flex gap-2 w-full lg:w-auto shrink-0">
                     <Button type="submit" className="w-full lg:w-auto">Filter</Button>
                     <Link href="/admission" className="w-full lg:w-auto items-center flex justify-center bg-muted text-muted-foreground hover:bg-slate-200 border rounded-md text-sm font-medium px-4 h-9">Reset</Link>
                   </div>
                </form>
                <div className="shrink-0 w-full xl:w-auto">
                   <DownloadCSV data={students} filename={`admission_history.csv`} />
                </div>
             </div>

             <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow>
                      <TableHead>GR No</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Date Admitted</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No recent admissions.</TableCell>
                      </TableRow>
                    ) : (
                      students.map(student => (
                        <TableRow key={student.id} className="hover:bg-slate-50/50">
                          <TableCell className="font-medium text-muted-foreground">{student.grNo}</TableCell>
                          <TableCell className="font-semibold">{student.firstName} {student.lastName}</TableCell>
                          <TableCell>{student.standard}-{student.division}</TableCell>
                          <TableCell>{student.createdAt.toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                             <Link href={`/print/admission/${student.id}`} target="_blank">
                               <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">Print Details</Button>
                             </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
             </div>
          </div>
        </div>

      </div>
    </main>
  );
}
