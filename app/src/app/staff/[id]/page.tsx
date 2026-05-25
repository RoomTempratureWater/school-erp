import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import StaffPicUpload from "@/components/StaffPicUpload";
import StaffDocumentUpload from "@/components/StaffDocumentUpload";
import { updateStaff } from "./actions";

export default async function StaffProfilePage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const id = parseInt(params.id, 10);
  const editing = searchParams.edit === "true";

  if (isNaN(id)) return notFound();

  const staff = await prisma.staff.findUnique({
    where: { id },
    include: {
      documents: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!staff) return notFound();

  function formatBytes(bytes: number | null) {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 w-full">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* ===================== HEADER ===================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              {staff.profilePicture ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={`/api/staff-profile-picture/${staff.id}`}
                  alt={`${staff.firstName}`}
                  className="size-16 rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
                  {staff.firstName[0]}
                  {staff.lastName[0]}
                </div>
              )}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                <StaffPicUpload staffId={staff.id} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {staff.firstName} {staff.lastName}
                </h1>
                <Badge
                  variant={staff.role === "TEACHING" ? "default" : "secondary"}
                >
                  {staff.role}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 text-sm font-medium">
                Emp ID: {staff.employeeId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/staff">
              <Button variant="outline">Back to Directory</Button>
            </Link>
            {editing ? (
              <Link href={`/staff/${staff.id}`}>
                <Button variant="outline">Cancel</Button>
              </Link>
            ) : (
              <Link href={`/staff/${staff.id}?edit=true`}>
                <Button>Edit Profile</Button>
              </Link>
            )}
          </div>
        </div>

        {/* ===================== EDIT FORM ===================== */}
        {editing && (
          <Card className="shadow-sm border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update staff details. Changes are saved immediately.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateStaff} className="space-y-4">
                <input type="hidden" name="id" value={staff.id} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">First Name</label>
                    <Input
                      name="firstName"
                      defaultValue={staff.firstName}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Last Name</label>
                    <Input
                      name="lastName"
                      defaultValue={staff.lastName}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Role</label>
                    <select
                      name="role"
                      defaultValue={staff.role}
                      className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm"
                    >
                      <option value="TEACHING">Teaching</option>
                      <option value="NON_TEACHING">Non-Teaching</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Phone Number</label>
                    <Input
                      name="phone"
                      defaultValue={staff.phone ?? ""}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Date of Joining</label>
                    <Input
                      type="date"
                      name="dateOfJoining"
                      defaultValue={staff.dateOfJoining ? new Date(staff.dateOfJoining).toISOString().split('T')[0] : ""}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Date of Leaving</label>
                    <Input
                      type="date"
                      name="dateOfLeaving"
                      defaultValue={staff.dateOfLeaving ? new Date(staff.dateOfLeaving).toISOString().split('T')[0] : ""}
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium">Reason for Leaving</label>
                    <Input
                      name="reasonForLeaving"
                      defaultValue={staff.reasonForLeaving ?? ""}
                      placeholder="If applicable..."
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium">Memos / Warnings</label>
                    <Textarea
                      name="memos"
                      defaultValue={staff.memos ? (staff.memos as any)[0]?.text : ""}
                      placeholder="Enter any memos or warnings..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium">Address</label>
                    <Textarea
                      name="address"
                      defaultValue={staff.address ?? ""}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium">Job Description</label>
                    <Textarea
                      name="jobDescription"
                      defaultValue={staff.jobDescription ?? ""}
                      placeholder="Outline roles and responsibilities..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium">Do's and Don'ts</label>
                    <Textarea
                      name="dosAndDonts"
                      defaultValue={staff.dosAndDonts ?? ""}
                      placeholder="Guidelines expected for this role..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium">Achievements</label>
                    <Textarea
                      name="achievements"
                      defaultValue={staff.achievements ?? ""}
                      placeholder="Notable awards or contributions..."
                      rows={3}
                    />
                  </div>
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ===================== INFO GRID ===================== */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                General Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-foreground font-medium mt-0.5">
                  {staff.phone || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-foreground font-medium mt-0.5 whitespace-pre-wrap">
                  {staff.address || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">System Created On</p>
                <p className="text-sm text-foreground font-medium mt-0.5">
                  {new Date(staff.createdAt).toLocaleDateString()}
                </p>
              </div>
              {staff.dateOfJoining && (
                <div>
                  <p className="text-sm font-medium text-blue-700">Date of Joining</p>
                  <p className="text-sm text-foreground font-medium mt-0.5">
                    {new Date(staff.dateOfJoining).toLocaleDateString()}
                  </p>
                </div>
              )}
              {staff.dateOfLeaving && (
                <div>
                  <p className="text-sm font-medium text-red-700">Date of Leaving</p>
                  <p className="text-sm text-foreground font-medium mt-0.5">
                    {new Date(staff.dateOfLeaving).toLocaleDateString()}
                  </p>
                </div>
              )}
              {staff.reasonForLeaving && (
                <div>
                  <p className="text-sm font-medium text-red-700">Reason for Leaving</p>
                  <p className="text-sm text-foreground font-medium mt-0.5">
                    {staff.reasonForLeaving}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Job Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Job Description</p>
                <p className="text-sm text-foreground font-medium mt-0.5 whitespace-pre-wrap">
                  {staff.jobDescription || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-700">Do's and Don'ts</p>
                <p className="text-sm text-foreground font-medium mt-0.5 whitespace-pre-wrap py-2 px-3 bg-amber-50 rounded-md border border-amber-100">
                  {staff.dosAndDonts || "No specific guidelines provided."}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {staff.achievements || "No achievements recorded yet."}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm md:col-span-2 border-red-100">
            <CardHeader className="pb-2 bg-red-50/50">
              <CardTitle className="text-sm font-medium text-red-800">
                Memos & Warnings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {staff.memos ? (
                <div className="space-y-3">
                  {(staff.memos as any[]).map((memo, idx) => (
                    <div key={idx} className="p-3 bg-red-50 border border-red-100 rounded-md">
                      <p className="text-xs text-red-500 font-semibold mb-1">
                        {new Date(memo.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-red-900 whitespace-pre-wrap">{memo.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No memos or warnings.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ===================== DOCUMENTS ===================== */}
        <Card className="shadow-sm border-blue-100">
          <CardHeader className="bg-blue-50/50 pb-4 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-blue-900">Staff Documents</CardTitle>
                <CardDescription className="text-blue-800/60">
                  Upload resumes, ID proofs, and certificates.
                </CardDescription>
              </div>
              <StaffDocumentUpload staffId={staff.id} />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {staff.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center italic">
                No documents uploaded yet. Click "Upload Documents" to add
                files.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {staff.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col justify-between border border-slate-200 rounded-lg p-4 bg-white hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="size-10 rounded bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {(doc.fileName.split(".").pop() || "?").toUpperCase().slice(0, 3)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 truncate" title={doc.fileName}>
                          {doc.fileName}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {formatBytes(doc.fileSize)} •{" "}
                          {doc.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-auto flex justify-end">
                      <a
                        href={`/api/staff-documents/${doc.id}`}
                        download
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-8 px-3 w-full"
                      >
                        Download Document
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
