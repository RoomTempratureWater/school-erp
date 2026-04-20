import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import ProfilePicUpload from "@/components/ProfilePicUpload";
import DocumentUpload from "@/components/DocumentUpload";
import { updateStudent } from "./actions";
import { ArrowRight } from "lucide-react";

export default async function StudentProfilePage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const id = parseInt(params.id, 10);
  const editing = searchParams.edit === "true";

  if (isNaN(id)) return notFound();

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      fees: {
        include: {
          feeCategory: true,
          transactions: {
            orderBy: { paymentDate: "desc" },
            take: 10,
          },
        },
      },
      documents: {
        orderBy: { createdAt: "desc" },
      },
      promotions: {
        include: { academicYear: true },
        orderBy: { promotedAt: "desc" },
      },
      marks: {
        include: { exam: { include: { academicYear: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!student) return notFound();

  // Flatten recent transactions across all fee buckets
  const recentTransactions = student.fees
    .flatMap((sf) =>
      sf.transactions.map((t) => ({
        ...t,
        feeName: sf.feeCategory.name,
      }))
    )
    .sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime())
    .slice(0, 8);

  // Fee summary
  const totalDue = student.fees.reduce((acc, f) => acc + f.amountDue, 0);
  const totalPaid = student.fees.reduce((acc, f) => acc + f.amountPaid, 0);
  const totalPending = totalDue - totalPaid;

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
              {student.profilePicture ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={`/api/profile-picture/${student.id}`}
                  alt={`${student.firstName}`}
                  className="size-16 rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
                  {student.firstName[0]}
                  {student.lastName[0]}
                </div>
              )}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                <ProfilePicUpload studentId={student.id} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {student.firstName} {student.lastName}
                </h1>
                <Badge
                  variant={student.status === "ACTIVE" ? "default" : "secondary"}
                >
                  {student.status}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                {student.enrollmentNo} • Class {student.standard}-
                {student.division}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/students">
              <Button variant="outline">Back to Directory</Button>
            </Link>
            {editing ? (
              <Link href={`/students/${student.id}`}>
                <Button variant="outline">Cancel</Button>
              </Link>
            ) : (
              <Link href={`/students/${student.id}?edit=true`}>
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
                Update student details. Changes are saved immediately.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateStudent} className="space-y-4">
                <input type="hidden" name="id" value={student.id} />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">First Name</label>
                    <Input
                      name="firstName"
                      defaultValue={student.firstName}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Last Name</label>
                    <Input
                      name="lastName"
                      defaultValue={student.lastName}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Date of Birth</label>
                    <Input
                      name="dateOfBirth"
                      type="date"
                      defaultValue={
                        new Date(student.dateOfBirth)
                          .toISOString()
                          .split("T")[0]
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Standard</label>
                    <Input
                      name="standard"
                      defaultValue={student.standard}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Division</label>
                    <Input
                      name="division"
                      defaultValue={student.division}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Status</label>
                    <select
                      name="status"
                      defaultValue={student.status}
                      className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="LEFT">LEFT</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">
                      Parent/Guardian
                    </label>
                    <Input
                      name="parentName"
                      defaultValue={student.parentName ?? ""}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">
                      Contact Number
                    </label>
                    <Input
                      name="contactNumber"
                      defaultValue={student.contactNumber ?? ""}
                    />
                  </div>
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ===================== INFO GRID ===================== */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                General Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Date of Birth</p>
                <p className="text-sm text-foreground font-medium mt-0.5">
                  {new Date(student.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Date Joined</p>
                <p className="text-sm text-foreground font-medium mt-0.5">
                  {new Date(student.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Contact & Family
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Parent/Guardian</p>
                <p className="text-sm text-foreground font-medium mt-0.5">
                  {student.parentName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Contact Number</p>
                <p className="text-sm text-foreground font-medium mt-0.5">
                  {student.contactNumber || "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm bg-emerald-50/50 border-emerald-200/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">
                Fee Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Billed</span>
                <span className="font-bold">
                  {totalDue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Paid</span>
                <span className="font-bold text-green-700">
                  {totalPaid.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="font-semibold">Pending Dues</span>
                <span
                  className={`font-black ${totalPending > 0 ? "text-red-600" : "text-green-700"}`}
                >
                  {totalPending.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              {totalPending > 0 && (
                <Link
                  href={`/print/dues/${student.id}`}
                  target="_blank"
                  className="block"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs text-red-600 border-red-200 hover:bg-red-50 mt-1"
                  >
                    Print Dues Reminder
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ===================== RECENT TRANSACTIONS + DOCUMENTS ===================== */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Fee Transactions */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Fee Transactions</CardTitle>
                  <CardDescription>
                    Latest payments across all fee categories.
                  </CardDescription>
                </div>
                <Link href={`/print/receipt/${student.id}`} target="_blank">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Print Full Receipt
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No transactions recorded yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="text-sm">
                          {t.paymentDate.toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium text-muted-foreground">
                          {t.feeName}
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                            {t.paymentMethod}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-700">
                          {t.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>
                    Upload and manage student records.
                  </CardDescription>
                </div>
                <DocumentUpload studentId={student.id} />
              </div>
            </CardHeader>
            <CardContent>
              {student.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No documents uploaded yet. Click "Upload Documents" to add
                  files.
                </p>
              ) : (
                <div className="space-y-2">
                  {student.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between border rounded-md px-3 py-2 bg-slate-50/50 hover:bg-slate-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-8 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {(doc.fileName.split(".").pop() || "?").toUpperCase().slice(0, 3)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {doc.fileName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatBytes(doc.fileSize)} •{" "}
                            {doc.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`/api/documents/${doc.id}`}
                        download
                        className="shrink-0"
                      >
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          Download
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ===================== ACADEMIC & PROGRESSION ===================== */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Progression Timeline */}
          <Card className="shadow-sm border-indigo-100 bg-indigo-50/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-indigo-500 animate-pulse"></span>
                Academic Progression
              </CardTitle>
              <CardDescription>Historical record of class and section changes.</CardDescription>
            </CardHeader>
            <CardContent>
              {student.promotions.length === 0 ? (
                <div className="text-center py-10">
                  <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <ArrowRight className="size-6 text-slate-300" />
                  </div>
                  <p className="text-sm text-muted-foreground italic">No promotion history recorded yet.</p>
                </div>
              ) : (
                <div className="relative space-y-6 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {student.promotions.map((p) => (
                    <div key={p.id} className="relative pl-10">
                      <div className="absolute left-0 top-1.5 size-9 rounded-full bg-white border-4 border-indigo-50 flex items-center justify-center shadow-sm z-10">
                        <Badge variant="outline" className="size-6 rounded-full p-0 flex items-center justify-center bg-indigo-500 text-white border-0 text-[10px]">
                          {p.academicYear?.name ? p.academicYear.name.substring(Math.max(0, p.academicYear.name.length - 2)) : "??"}
                        </Badge>
                      </div>
                      <div className="bg-white border rounded-xl p-4 shadow-sm group hover:border-indigo-200 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-slate-900">{p.academicYear.name}</span>
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                            {new Date(p.promotedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <Badge variant="secondary" className="px-2 py-0">{p.fromStandard}-{p.fromDivision}</Badge>
                          </div>
                          <ArrowRight className="size-4 text-slate-400" />
                          <div className="flex flex-col items-center">
                            <Badge className="px-2 py-0 bg-emerald-500 hover:bg-emerald-600 border-0">{p.toStandard}-{p.toDivision}</Badge>
                          </div>
                        </div>
                        {p.remarks && <p className="mt-2 text-xs text-slate-500 italic">"{p.remarks}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Academic Records */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Academic Records</CardTitle>
              <CardDescription>Latest examination marks.</CardDescription>
            </CardHeader>
            <CardContent>
              {student.marks.length === 0 ? (
                <p className="text-sm text-center py-10 text-muted-foreground italic">No exam marks recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {/* Group by exam */}
                  {Object.values(
                    student.marks.reduce((acc, m) => {
                      const eid = m.examId;
                      if (!acc[eid]) acc[eid] = { exam: m.exam, marks: [] };
                      acc[eid].marks.push(m);
                      return acc;
                    }, {} as Record<number, { exam: any, marks: any[] }>)
                  ).map(({ exam, marks }) => {
                    const totalObtained = marks.reduce((acc, m) => acc + m.marksObtained, 0);
                    const totalMax = marks.reduce((acc, m) => acc + m.maxMarks, 0);
                    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

                    return (
                      <div key={exam.id} className="border rounded-xl p-4 bg-slate-50/50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-slate-900">{exam.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-medium">{exam.academicYear?.name || "N/A"} · Std {exam.standard}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-primary">{percentage.toFixed(1)}%</p>
                            <p className="text-[10px] font-mono text-muted-foreground">{totalObtained}/{totalMax}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {marks.map(m => (
                            <div key={m.id} className="flex flex-col items-center justify-center px-3 py-2 bg-white border border-slate-200 rounded-lg min-w-[70px] shadow-sm">
                              <span className="text-[9px] font-bold text-slate-400 uppercase truncate w-full text-center mb-1">{m.subject}</span>
                              <span className="text-sm font-black text-slate-800">{m.marksObtained}</span>
                              <div className="w-full bg-slate-100 h-1 mt-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${m.marksObtained / m.maxMarks < 0.35 ? 'bg-red-400' : 'bg-emerald-400'}`} 
                                  style={{ width: `${Math.min(100, (m.marksObtained / m.maxMarks) * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
