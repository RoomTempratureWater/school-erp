import { prisma } from "@/lib/prisma";
import DownloadCSV from "@/components/DownloadCSV";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function StudentsPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
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
    orderBy: { firstName: 'asc' }
  });

  // Server Action for form submission
  async function searchAction(formData: FormData) {
    "use server";
    const q = formData.get("q") as string;
    const std = formData.get("standard") as string;
    const div = formData.get("division") as string;
    
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    if (std) params.set("standard", std);
    if (div) params.set("division", div);
    
    redirect(`/students?${params.toString()}`);
  }

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 w-full">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Directory</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage student records, filter segments, and export lists.</p>
          </div>
          <DownloadCSV data={students} filename={`students_export_${new Date().toISOString().split('T')[0]}.csv`} />
        </div>

        <form action={searchAction} className="bg-card border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-end shadow-sm transiton-all">
          <div className="space-y-1 flex-1 w-full">
            <label className="text-xs font-medium text-muted-foreground">Search</label>
            <Input name="q" placeholder="Name or GR No" defaultValue={search} className="bg-white" />
          </div>
          <div className="space-y-1 w-full md:w-48">
            <label className="text-xs font-medium text-muted-foreground">Standard</label>
            <Input name="standard" placeholder="E.g. 10" defaultValue={standard} className="bg-white" />
          </div>
          <div className="space-y-1 w-full md:w-32">
            <label className="text-xs font-medium text-muted-foreground">Division</label>
            <Input name="division" placeholder="E.g. A" defaultValue={division} className="bg-white" />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button type="submit" className="w-full md:w-24">Filter</Button>
            <Link href="/students" className="w-full md:w-24 text-center items-center flex justify-center bg-muted text-muted-foreground hover:bg-slate-200 border rounded-md text-sm font-medium h-9">Reset</Link>
          </div>
        </form>

        <div className="bg-card border rounded-lg overflow-x-auto shadow-sm">
          <Table className="whitespace-nowrap min-w-max">
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead>GR No</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>PEN No</TableHead>
                <TableHead>Appar ID</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right sticky right-0 bg-slate-50/90 shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.1)]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No students found.</TableCell>
                </TableRow>
              ) : (
                students.map(student => (
                  <TableRow key={student.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-muted-foreground">{student.grNo}</TableCell>
                    <TableCell className="font-semibold">{student.firstName} {student.middleName ? student.middleName + ' ' : ''}{student.lastName}</TableCell>
                    <TableCell>
                      <Badge variant={student.status === "ACTIVE" ? "default" : "secondary"}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{student.standard}-{student.division}</TableCell>
                    <TableCell>{student.penNo || "—"}</TableCell>
                    <TableCell>{student.apparId || "—"}</TableCell>
                    <TableCell>{student.mobileNumber || "—"}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={student.currentAddress || ""}>{student.currentAddress || "—"}</TableCell>
                    <TableCell className="text-right sticky right-0 bg-white shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.1)]">
                      <Link href={`/students/${student.id}`}>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">View Profile</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}
