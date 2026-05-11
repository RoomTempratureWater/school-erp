import { prisma } from "@/lib/prisma";
import DownloadCSV from "@/components/DownloadCSV";
import PaymentForm from "@/components/PaymentForm";
import SchoolYearFilter from "@/components/SchoolYearFilter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";
import { processPayment, filterFees, filterDues, deleteStudentFee, deletePaymentTransaction } from "./actions";
import DeleteWithDoubleConfirm from "@/components/DeleteWithDoubleConfirm";

function getDefaultDateFrom(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split("T")[0];
}

function getDefaultDateTo(): string {
  return new Date().toISOString().split("T")[0];
}

export default async function FeesPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const search = searchParams.search;
  const paymentMethodFilter = searchParams.paymentMethod;
  const yearIdParam = searchParams.yearId;
  const dateFromParam = searchParams.dateFrom;
  const dateToParam = searchParams.dateTo;
  const referenceParam = searchParams.reference;

  // Dues-specific filters
  const duesSearchParam = searchParams.duesSearch;
  const duesDateFromParam = searchParams.duesDateFrom;
  const duesDateToParam = searchParams.duesDateTo;
  const duesReferenceParam = searchParams.duesReference;

  // Default date values
  const dateFrom = dateFromParam || getDefaultDateFrom();
  const dateTo = dateToParam || getDefaultDateTo();
  const duesDateFrom = duesDateFromParam || getDefaultDateFrom();
  const duesDateTo = duesDateToParam || getDefaultDateTo();

  // Fetch academic years for filter
  const academicYears = await prisma.academicYear.findMany({ orderBy: { createdAt: 'desc' } });
  const currentYear = academicYears.find(ay => ay.isCurrent) || academicYears[0] || null;

  // Determine the active year filter — default to current year
  const activeYearId = yearIdParam ? parseInt(yearIdParam, 10) : (currentYear?.id || null);

  const categories = await prisma.feeCategory.findMany({ 
    include: { academicYear: true },
    orderBy: { createdAt: 'desc' } 
  });

  // Build the where clause for transactions
  const txWhere: any = {};
  if (paymentMethodFilter) txWhere.paymentMethod = paymentMethodFilter as any;
  
  // Student search filter
  if (search) {
    txWhere.studentFee = {
      ...txWhere.studentFee,
      student: {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { enrollmentNo: { contains: search, mode: 'insensitive' } },
          { contactNumber: { contains: search, mode: 'insensitive' } },
        ]
      }
    };
  }

  // School year filter for transactions
  if (activeYearId) {
    txWhere.studentFee = {
      ...txWhere.studentFee,
      feeCategory: {
        academicYearId: activeYearId
      }
    };
  }

  // Date range filter for transactions
  const dateFromDate = new Date(dateFrom);
  dateFromDate.setHours(0, 0, 0, 0);
  const dateToDate = new Date(dateTo);
  dateToDate.setHours(23, 59, 59, 999);
  txWhere.paymentDate = {
    gte: dateFromDate,
    lte: dateToDate,
  };

  // Reference filter for transactions
  if (referenceParam) {
    txWhere.reference = { contains: referenceParam, mode: 'insensitive' };
  }

  // LEDGER
  const transactions = await prisma.paymentTransaction.findMany({
    where: txWhere,
    include: {
      studentFee: {
        include: {
          student: true,
          feeCategory: { include: { academicYear: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const csvData = transactions.map(t => ({
    TransactionID: t.id,
    Date: t.paymentDate.toLocaleDateString(),
    EnrollmentNo: t.studentFee.student.enrollmentNo,
    StudentName: `${t.studentFee.student.firstName} ${t.studentFee.student.lastName}`,
    FeeCategory: t.studentFee.feeCategory.name,
    AcademicYear: t.studentFee.feeCategory.academicYear.name,
    AmountPaid: t.amount,
    Method: t.paymentMethod,
    Reference: t.reference || ''
  }));

  // PENDING BALANCES — also filtered by year
  const pendingWhere: any = {
    fees: { some: { status: { not: "PAID" } } }
  };

  const feeWhere: any = {
    status: { not: "PAID" as const }
  };

  if (activeYearId) {
    feeWhere.feeCategory = { academicYearId: activeYearId };
    pendingWhere.fees = { some: { ...feeWhere } };
  }

  // Apply dues search filter
  if (duesSearchParam) {
    pendingWhere.OR = [
      { firstName: { contains: duesSearchParam, mode: 'insensitive' } },
      { lastName: { contains: duesSearchParam, mode: 'insensitive' } },
      { enrollmentNo: { contains: duesSearchParam, mode: 'insensitive' } },
    ];
  }

  const studentsWithDues = await prisma.student.findMany({
    where: pendingWhere,
    include: { 
      fees: { 
        where: feeWhere, 
        include: { 
          feeCategory: { include: { academicYear: true } },
          transactions: {
            orderBy: { paymentDate: 'desc' }
          }
        } 
      } 
    }
  });

  // Filter out students whose fees array ended up empty after year filter
  // Also apply dues date range and reference filters
  const duesDateFromDate = new Date(duesDateFrom);
  duesDateFromDate.setHours(0, 0, 0, 0);
  const duesDateToDate = new Date(duesDateTo);
  duesDateToDate.setHours(23, 59, 59, 999);

  const pendingBalances: any[] = [];

  studentsWithDues.forEach(s => {
    let filteredFees = s.fees;
    
    // If dues reference filter is applied, only show fees that have a matching transaction reference
    if (duesReferenceParam) {
      filteredFees = filteredFees.filter(f => 
        f.feeCategory.name.toLowerCase().includes(duesReferenceParam.toLowerCase())
      );
    }

    filteredFees.forEach(f => {
      const pending = f.amountDue - f.amountPaid;
      if (pending > 0) {
        pendingBalances.push({
          student: s,
          fee: f,
          pending
        });
      }
    });
  });

  const duesCsvData = pendingBalances.map(pb => ({
    EnrollmentNo: pb.student.enrollmentNo,
    StudentName: `${pb.student.firstName} ${pb.student.lastName}`,
    Class: `${pb.fee.studentStandard || pb.student.standard}-${pb.fee.studentDivision || pb.student.division}`,
    AcademicYear: pb.fee.feeCategory.academicYear.name,
    FeeCategory: pb.fee.feeCategory.name,
    TotalDue: pb.fee.amountDue,
    TotalPaid: pb.fee.amountPaid,
    PendingAmount: pb.pending
  }));

  async function searchAction(formData: FormData) {
    "use server";
    const queryString = await filterFees(formData);
    redirect(`/fees?${queryString}`);
  }

  async function duesSearchAction(formData: FormData) {
    "use server";
    const queryString = await filterDues(formData);
    redirect(`/fees?${queryString}`);
  }

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 w-full print:bg-white print:p-0">
      <div className="mx-auto max-w-7xl space-y-8 print:m-0 print:max-w-none print:space-y-0">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fee Management</h1>
            <p className="text-muted-foreground mt-1 text-sm">Process payments, view transaction ledger, and monitor pending dues.</p>
          </div>
          <SchoolYearFilter
            academicYears={academicYears.map(ay => ({ id: ay.id, name: ay.name, isCurrent: ay.isCurrent }))}
            currentYearId={currentYear?.id || null}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-4 items-start">
          
          <div className="lg:col-span-1 space-y-8">
             <Card className="shadow-sm sticky top-24">
                <CardHeader>
                   <CardTitle>Process Payment</CardTitle>
                   <CardDescription>Record a new fee collection. Installments are calculated dynamically.</CardDescription>
                </CardHeader>
                <CardContent>
                   <PaymentForm
                     academicYears={academicYears.map(ay => ({ id: ay.id, name: ay.name, isCurrent: ay.isCurrent }))}
                     categories={categories.map(c => ({ id: c.id, name: c.name, amount: c.amount, academicYearId: c.academicYearId, academicYearName: c.academicYear.name }))}
                     currentYearId={currentYear?.id || null}
                     action={processPayment}
                   />
                </CardContent>
             </Card>
          </div>

          <div className="lg:col-span-3 space-y-12">

             {/* LEDGER SECTION — now comes first */}
             <div className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight">Ledger Transactions History</h2>
                <div className="border rounded-lg p-4 bg-card shadow-sm space-y-4">
                   <form action={searchAction} className="flex flex-wrap gap-4 items-end w-full">
                      <input type="hidden" name="yearId" value={activeYearId ? String(activeYearId) : ""} />
                      <div className="space-y-1 flex-1 min-w-[140px]">
                        <label className="text-xs font-medium text-muted-foreground">Search Student/Roll</label>
                        <Input name="q" placeholder="Name or Enrollment No" defaultValue={search} className="bg-white" />
                      </div>
                      <div className="space-y-1 w-full sm:w-28 shrink-0">
                        <label className="text-xs font-medium text-muted-foreground">Method</label>
                        <select name="paymentMethod" defaultValue={paymentMethodFilter} className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                          <option value="">All</option>
                          <option value="CASH">Cash</option>
                          <option value="UPI">UPI</option>
                          <option value="CHEQUE">Cheque</option>
                          <option value="BANK_TRANSFER">Bank Tx</option>
                        </select>
                      </div>
                      <div className="space-y-1 w-full sm:w-36 shrink-0">
                        <label className="text-xs font-medium text-muted-foreground">From Date</label>
                        <Input name="dateFrom" type="date" defaultValue={dateFrom} className="bg-white" />
                      </div>
                      <div className="space-y-1 w-full sm:w-36 shrink-0">
                        <label className="text-xs font-medium text-muted-foreground">To Date</label>
                        <Input name="dateTo" type="date" defaultValue={dateTo} className="bg-white" />
                      </div>
                      <div className="space-y-1 w-full sm:w-36 shrink-0">
                        <label className="text-xs font-medium text-muted-foreground">Reference</label>
                        <Input name="reference" placeholder="UTR, Ref No." defaultValue={referenceParam} className="bg-white" />
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto shrink-0">
                        <Button type="submit" className="w-full sm:w-auto">Filter</Button>
                        <Link href="/fees" className="w-full sm:w-auto items-center flex justify-center bg-muted text-muted-foreground hover:bg-slate-200 border rounded-md text-sm font-medium px-4 h-9">Reset</Link>
                        <DownloadCSV data={csvData} filename={`fee_ledger.csv`} />
                      </div>
                   </form>
                </div>

                <div className="bg-card border rounded-lg overflow-hidden shadow-sm" style={{ maxHeight: '70vh' }}>
                   <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
                     <Table>
                       <TableHeader className="bg-slate-50/80 sticky top-0 z-10">
                         <TableRow>
                           <TableHead>Date</TableHead>
                           <TableHead>Student</TableHead>
                           <TableHead>Fee Type</TableHead>
                           <TableHead>Year</TableHead>
                           <TableHead>Method</TableHead>
                           <TableHead>Reference</TableHead>
                           <TableHead className="text-right">Amount (INR)</TableHead>
                           <TableHead className="text-center">Action</TableHead>
                         </TableRow>
                       </TableHeader>
                       <TableBody>
                         {transactions.length === 0 ? (
                           <TableRow>
                             <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No transactions found.</TableCell>
                           </TableRow>
                         ) : (
                           transactions.map(t => (
                             <TableRow key={t.id} className="hover:bg-slate-50/50">
                               <TableCell className="text-sm">{t.paymentDate.toLocaleDateString()}</TableCell>
                               <TableCell>
                                  <Link href={`/students/${t.studentFee.student.id}`} className="hover:underline">
                                    <div className="font-semibold text-primary">{t.studentFee.student.firstName} {t.studentFee.student.lastName}</div>
                                    <div className="text-xs text-muted-foreground">{t.studentFee.student.enrollmentNo}</div>
                                  </Link>
                               </TableCell>
                               <TableCell className="text-muted-foreground font-medium">{t.studentFee.feeCategory.name}</TableCell>
                               <TableCell>
                                 <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                                   {t.studentFee.feeCategory.academicYear.name}
                                 </span>
                               </TableCell>
                               <TableCell>
                                 <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 px-2 py-1 rounded">
                                   {t.paymentMethod}
                                 </span>
                               </TableCell>
                               <TableCell className="text-sm text-muted-foreground">{t.reference || '—'}</TableCell>
                               <TableCell className="text-right font-bold text-green-700">{t.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                               <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Link href={`/print/receipt/${t.studentFee.student.id}?tx=${t.id}`} target="_blank">
                                      <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10">Print</Button>
                                    </Link>
                                    <DeleteWithDoubleConfirm id={t.id} action={deletePaymentTransaction} itemDescription="Payment" />
                                  </div>
                               </TableCell>
                             </TableRow>
                           ))
                         )}
                       </TableBody>
                     </Table>
                   </div>
                </div>
             </div>

             {/* PENDING BALANCES SECTION — now comes after ledger */}
             <div className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight">Pending Dues &amp; Installments Tracker</h2>
                <div className="border rounded-lg p-4 bg-card shadow-sm space-y-4">
                   <form action={duesSearchAction} className="flex flex-wrap gap-4 items-end w-full">
                      <input type="hidden" name="yearId" value={activeYearId ? String(activeYearId) : ""} />
                      {/* Preserve ledger filters in hidden fields */}
                      <input type="hidden" name="ledgerSearch" value={search || ""} />
                      <input type="hidden" name="ledgerPaymentMethod" value={paymentMethodFilter || ""} />
                      <input type="hidden" name="ledgerDateFrom" value={dateFromParam || ""} />
                      <input type="hidden" name="ledgerDateTo" value={dateToParam || ""} />
                      <input type="hidden" name="ledgerReference" value={referenceParam || ""} />
                      
                      <div className="space-y-1 flex-1 min-w-[140px]">
                        <label className="text-xs font-medium text-muted-foreground">Search Student/Roll</label>
                        <Input name="q" placeholder="Name or Enrollment No" defaultValue={duesSearchParam} className="bg-white" />
                      </div>
                      <div className="space-y-1 w-full sm:w-36 shrink-0">
                        <label className="text-xs font-medium text-muted-foreground">From Date</label>
                        <Input name="duesDateFrom" type="date" defaultValue={duesDateFrom} className="bg-white" />
                      </div>
                      <div className="space-y-1 w-full sm:w-36 shrink-0">
                        <label className="text-xs font-medium text-muted-foreground">To Date</label>
                        <Input name="duesDateTo" type="date" defaultValue={duesDateTo} className="bg-white" />
                      </div>
                      <div className="space-y-1 w-full sm:w-36 shrink-0">
                        <label className="text-xs font-medium text-muted-foreground">Fee Category</label>
                        <Input name="duesReference" placeholder="Category name" defaultValue={duesReferenceParam} className="bg-white" />
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto shrink-0">
                        <Button type="submit" className="w-full sm:w-auto">Filter</Button>
                        <Link href="/fees" className="w-full sm:w-auto items-center flex justify-center bg-muted text-muted-foreground hover:bg-slate-200 border rounded-md text-sm font-medium px-4 h-9">Reset</Link>
                        <DownloadCSV data={duesCsvData} filename={`pending_dues.csv`} />
                      </div>
                   </form>
                </div>

                <div className="bg-card border rounded-lg overflow-hidden shadow-sm" style={{ maxHeight: '70vh' }}>
                   <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
                     <Table>
                       <TableHeader className="bg-red-50/50 sticky top-0 z-10">
                         <TableRow>
                           <TableHead>Student</TableHead>
                           <TableHead>Class</TableHead>
                           <TableHead>Pending Fee Category</TableHead>
                           <TableHead className="text-right">Amount Pending (INR)</TableHead>
                           <TableHead className="text-center">Action</TableHead>
                         </TableRow>
                       </TableHeader>
                       <TableBody>
                         {pendingBalances.length === 0 ? (
                           <TableRow>
                             <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">All students have cleared their dues.</TableCell>
                           </TableRow>
                         ) : (
                           pendingBalances.map(pb => (
                             <TableRow key={pb.fee.id} className="hover:bg-slate-50/50">
                               <TableCell>
                                  <Link href={`/students/${pb.student.id}`} className="hover:underline">
                                    <div className="font-semibold text-primary">{pb.student.firstName} {pb.student.lastName}</div>
                                    <div className="text-xs text-muted-foreground">{pb.student.enrollmentNo}</div>
                                  </Link>
                               </TableCell>
                               <TableCell>{pb.fee.studentStandard || pb.student.standard}-{pb.fee.studentDivision || pb.student.division}</TableCell>
                               <TableCell>
                                 <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-muted-foreground border">
                                   {pb.fee.feeCategory.name}
                                 </span>
                                 <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 ml-1">
                                   {pb.fee.feeCategory.academicYear.name}
                                 </span>
                               </TableCell>
                               <TableCell className="text-right font-bold text-red-600">{pb.pending.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                               <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Link href={`/print/dues/${pb.student.id}?feeId=${pb.fee.id}`} target="_blank">
                                      <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-100">Print Dues</Button>
                                    </Link>
                                    <DeleteWithDoubleConfirm id={pb.fee.id} action={deleteStudentFee} itemDescription="Pending Fee" />
                                  </div>
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
        </div>

      </div>
    </main>
  );
}
