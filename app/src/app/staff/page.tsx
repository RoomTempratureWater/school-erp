import { prisma } from "@/lib/prisma";
import DownloadCSV from "@/components/DownloadCSV";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function StaffPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const search = searchParams.search;
  const role = searchParams.role;

  const staffMembers = await prisma.staff.findMany({
    where: {
      OR: search ? [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
      ] : undefined,
      role: role ? (role as any) : undefined,
    },
    orderBy: { firstName: 'asc' }
  });

  // Server Action for form submission
  async function searchAction(formData: FormData) {
    "use server";
    const q = formData.get("q") as string;
    const r = formData.get("role") as string;
    
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    if (r && r !== "ALL") params.set("role", r);
    
    redirect(`/staff?${params.toString()}`);
  }

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 w-full">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Staff Directory</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage staff records, filter by roles, and export lists.</p>
          </div>
          <div className="flex gap-2">
			<Link href="/staff/new">
              <Button>Add New Staff</Button>
            </Link>
            <DownloadCSV data={staffMembers} filename={`staff_export_${new Date().toISOString().split('T')[0]}.csv`} />
          </div>
        </div>

        <form action={searchAction} className="bg-card border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-end shadow-sm transiton-all">
          <div className="space-y-1 flex-1 w-full">
            <label className="text-xs font-medium text-muted-foreground">Search</label>
            <Input name="q" placeholder="Name or Employee ID" defaultValue={search} className="bg-white" />
          </div>
          <div className="space-y-1 w-full md:w-48">
            <label className="text-xs font-medium text-muted-foreground">Role</label>
            <select
              name="role"
              defaultValue={role || "ALL"}
              className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm"
            >
              <option value="ALL">All Roles</option>
              <option value="TEACHING">Teaching</option>
              <option value="NON_TEACHING">Non-Teaching</option>
            </select>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button type="submit" className="w-full md:w-24">Filter</Button>
            <Link href="/staff" className="w-full md:w-24 text-center items-center flex justify-center bg-muted text-muted-foreground hover:bg-slate-200 border rounded-md text-sm font-medium h-9">Reset</Link>
          </div>
        </form>

        <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Staff Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No staff members found.</TableCell>
                </TableRow>
              ) : (
                staffMembers.map(staff => (
                  <TableRow key={staff.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-muted-foreground">{staff.employeeId}</TableCell>
                    <TableCell className="font-semibold px-4 py-2">
                       <div className="flex items-center gap-3">
                          {staff.profilePicture ? (
                             <img src={`/api/staff-profile-picture/${staff.id}`} alt={staff.firstName} className="size-8 rounded-full object-cover" />
                          ) : (
                             <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                               {staff.firstName[0]}{staff.lastName[0]}
                             </div>
                          )}
                          <span>{staff.firstName} {staff.lastName}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={staff.role === "TEACHING" ? "default" : "secondary"}>
                        {staff.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{staff.phone || "—"}</TableCell>
                    <TableCell>{staff.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/staff/${staff.id}`}>
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
