import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AutoPrint from '@/components/AutoPrint';

export default async function PrintFeeReceipt(
  props: { params: Promise<{ id: string }>, searchParams: Promise<{ tx?: string }> }
) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const id = parseInt(params.id, 10);
  const txId = searchParams.tx ? parseInt(searchParams.tx, 10) : null;
  
  if (isNaN(id)) return notFound();

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      fees: {
        include: {
          feeCategory: { include: { academicYear: true } },
          transactions: {
            orderBy: { paymentDate: 'asc' }
          }
        }
      }
    }
  });

  if (!student) return notFound();

  let targetTx: any = null;
  let allTransactions: any[] = [];
  let totalAnnual = 0;
  let totalPaid = 0;

  student.fees.forEach(sf => {
    totalAnnual += sf.amountDue;
    totalPaid += sf.amountPaid;
    sf.transactions.forEach(t => {
      allTransactions.push(t);
      if (txId && t.id === txId) targetTx = t;
    });
  });

  allTransactions.sort((a, b) => a.paymentDate.getTime() - b.paymentDate.getTime());
  
  const currentTxDate = targetTx ? targetTx.paymentDate : (allTransactions.length > 0 ? allTransactions[allTransactions.length - 1].paymentDate : new Date());
  const receiptNo = targetTx ? targetTx.id : (allTransactions.length > 0 ? allTransactions[allTransactions.length - 1].id : 'N/A');
  const academicYear = student.fees.length > 0 ? student.fees[0].feeCategory.academicYear.name : 'N/A';

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @page {
            size: A5;
            margin: 0;
        }
        body { 
            font-family: 'Times New Roman', Times, serif; 
            background-color: #f3f4f6;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
        }
        .receipt-container {
            width: 148mm;
            height: 210mm;
            margin: 0 auto;
            padding: 10mm;
            background-color: #ffffff;
            box-sizing: border-box;
            position: relative;
            border: 1px solid #d1d5db;
        }
        @media print {
            body { background-color: #ffffff; }
            .receipt-container {
                margin: 0;
                border: none;
                width: 148mm;
                height: 210mm;
            }
        }
        .data-text {
            color: #8b1a1a; 
            font-style: italic;
            font-weight: bold;
        }
        .section-title {
            border-bottom: 1px solid #374151;
            text-transform: uppercase;
            font-size: 0.75rem;
            font-weight: bold;
            margin-bottom: 6px;
            padding-bottom: 2px;
        }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; font-size: 0.7rem; text-transform: uppercase; color: #4b5563; border-bottom: 1px solid #d1d5db; padding: 4px; }
        td { padding: 4px; border-bottom: 1px dotted #e5e7eb; font-size: 0.85rem; }
      `}} />

      <div className="receipt-container">
          <div className="text-center mb-4">
              <p className="text-[10px] uppercase tracking-widest font-bold leading-tight">The SSMVI</p>
              <h1 className="text-2xl font-extrabold uppercase">Epiphany School</h1>
              <p className="text-xs">5, Guruwar Peth, Panch Howd, Pune - 411042</p>
              <p className="text-[10px] text-gray-600">Ph: 24467524 | Recognition No: 1497</p>
              <div className="mt-2 border-y border-gray-800 py-1 inline-block px-8">
                  <h2 className="text-lg font-bold uppercase tracking-tight">Official Fee Receipt</h2>
              </div>
          </div>

          <div className="flex justify-between mb-4 text-[11px]">
              <div>
                  <p><strong>Receipt No:</strong> <span className="data-text">{receiptNo}</span></p>
                  <p><strong>Date:</strong> <span className="data-text">{currentTxDate.toLocaleDateString('en-GB', {day: '2-digit', month:'short', year:'numeric'})}</span></p>
              </div>
              <div className="text-right">
                  <p><strong>Academic Year:</strong> <span className="data-text">{academicYear}</span></p>
                  <p><strong>Standard:</strong> <span className="data-text">{student.standard} - {student.division}</span></p>
              </div>
          </div>

          <div className="mb-4">
              <div className="flex border-b border-gray-100 pb-1">
                  <span className="w-28 font-bold text-[11px] uppercase text-gray-500">Student Name:</span>
                  <span className="data-text text-md">{student.firstName} {student.lastName}</span>
              </div>
          </div>

          <div className="mb-4">
              <h3 className="section-title">Current Fee Breakdown</h3>
              <table>
                  <thead>
                      <tr>
                          <th>Fee Particulars</th>
                          <th className="text-right">Amount (INR)</th>
                      </tr>
                  </thead>
                  <tbody>
                      {student.fees.length === 0 && (
                          <tr><td colSpan={2} className="text-center text-xs text-gray-400">No active fee categories assigned.</td></tr>
                      )}
                      {student.fees.map(sf => (
                          <tr key={sf.id}>
                              <td>{sf.feeCategory.name}</td>
                              <td className="text-right data-text">{sf.amountDue.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>

          <div className="mb-4">
              <h3 className="section-title">Payment History</h3>
              <table className="bg-gray-50/50">
                  <thead>
                      <tr>
                          <th>Date Paid</th>
                          <th>Reference / Method</th>
                          <th className="text-right">Amount Paid</th>
                      </tr>
                  </thead>
                  <tbody className="text-[11px]">
                      {allTransactions.length === 0 && (
                          <tr><td colSpan={3} className="text-center text-xs text-gray-400">No payments verified.</td></tr>
                      )}
                      {allTransactions.map(tx => (
                          <tr key={tx.id} className={tx.id === txId ? "bg-yellow-50" : ""}>
                              <td>{tx.paymentDate.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}</td>
                              <td>{tx.reference || tx.paymentMethod}</td>
                              <td className="text-right data-text">{tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>

          <div className="border border-gray-800 p-3 mt-2">
              <div className="grid grid-cols-2 gap-2">
                  <div className="text-[9px] italic text-gray-500 self-center leading-tight">
                      * Computer-generated receipt. <br/>
                      * Fees once paid are non-refundable.
                  </div>
                  <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                          <span>Total Annual:</span>
                          <span className="font-bold">{totalAnnual.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                          <span>Total Paid:</span>
                          <span className="font-bold">{totalPaid.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between text-md border-t border-gray-800 pt-1 mt-1 font-black">
                          <span>DUE:</span>
                          <span className="data-text">{(totalAnnual - totalPaid).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                  </div>
              </div>
          </div>

          <div className="absolute bottom-10 left-10 right-10 flex justify-between">
              <div className="text-center">
                  <div className="w-32 border-b border-gray-400 mb-1"></div>
                  <p className="text-[9px] uppercase font-bold">Authorised signatory</p>
              </div>
              <div className="text-center">
                  <div className="w-32 border-b border-gray-900 mb-1"></div>
                  <p className="text-[11px] font-extrabold uppercase">Principal</p>
                  <p className="text-[9px]">Epiphany School, Pune</p>
              </div>
          </div>
      </div>
      {/* Auto-Trigger Print Dialog */}
      <AutoPrint />
    </>
  );
}
