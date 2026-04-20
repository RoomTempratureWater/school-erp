import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function PrintDuesReceipt(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const idStr = params.id;
  const id = parseInt(idStr, 10);
  
  if (isNaN(id)) return notFound();

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      fees: {
        where: { status: { not: "PAID" } },
        include: { feeCategory: true }
      }
    }
  });

  if (!student) return notFound();

  let totalPending = 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @page { size: A5; margin: 0; }
        body { font-family: 'Times New Roman', Times, serif; background-color: #f3f4f6; margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
        .receipt-container { width: 148mm; height: 210mm; margin: 0 auto; padding: 10mm; background-color: #ffffff; box-sizing: border-box; position: relative; border: 1px solid #d1d5db; }
        @media print { body { background-color: #ffffff; } .receipt-container { margin: 0; border: none; width: 148mm; height: 210mm; } }
        .data-text { color: #8b1a1a; font-style: italic; font-weight: bold; }
        .section-title { border-bottom: 1px solid #374151; text-transform: uppercase; font-size: 0.75rem; font-weight: bold; margin-bottom: 6px; padding-bottom: 2px; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; font-size: 0.7rem; text-transform: uppercase; color: #4b5563; border-bottom: 1px solid #d1d5db; padding: 4px; }
        td { padding: 4px; border-bottom: 1px dotted #e5e7eb; font-size: 0.85rem; }
      `}} />

      <div className="receipt-container">
          <div className="text-center mb-4">
              <p className="text-[10px] uppercase tracking-widest font-bold leading-tight">The SSMVI</p>
              <h1 className="text-2xl font-extrabold uppercase">Epiphany School</h1>
              <p className="text-xs">5, Guruwar Peth, Panch Howd, Pune - 411042</p>
              <div className="mt-2 border-y border-gray-800 py-1 inline-block px-8">
                  <h2 className="text-lg font-bold uppercase tracking-tight text-red-800">Pending Dues Reminder</h2>
              </div>
          </div>

          <div className="flex justify-between mb-4 text-[11px]">
              <div>
                  <p><strong>Notice Date:</strong> <span className="data-text">{new Date().toLocaleDateString('en-GB', {day: '2-digit', month:'short', year:'numeric'})}</span></p>
              </div>
              <div className="text-right">
                  <p><strong>Standard:</strong> <span className="data-text">{student.standard} - {student.division}</span></p>
              </div>
          </div>

          <div className="mb-4">
              <div className="flex border-b border-gray-100 pb-1">
                  <span className="w-28 font-bold text-[11px] uppercase text-gray-500">Student Name:</span>
                  <span className="data-text text-md">{student.firstName} {student.lastName} (ENR: {student.enrollmentNo})</span>
              </div>
          </div>

          <div className="mb-8">
              <p className="text-xs mb-4">Dear Parent/Guardian, this is a formal system reminder regarding outstanding fee installments mapped to your account. Kindly clear the pending balances at the earliest.</p>
              <h3 className="section-title">Pending Installments Breakdown</h3>
              <table>
                  <thead className="bg-red-50">
                      <tr>
                          <th>Category</th>
                          <th className="text-right">Total Billed</th>
                          <th className="text-right">Paid So Far</th>
                          <th className="text-right">Amount Pending (INR)</th>
                      </tr>
                  </thead>
                  <tbody>
                      {student.fees.length === 0 && (
                          <tr><td colSpan={4} className="text-center text-xs text-gray-400">All clear!</td></tr>
                      )}
                      {student.fees.map(sf => {
                          const pending = sf.amountDue - sf.amountPaid;
                          totalPending += pending;
                          return (
                          <tr key={sf.id}>
                              <td>{sf.feeCategory.name}</td>
                              <td className="text-right text-gray-500">{sf.amountDue.toLocaleString()}</td>
                              <td className="text-right text-gray-500">{sf.amountPaid.toLocaleString()}</td>
                              <td className="text-right data-text text-red-600 font-black">{pending.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          </tr>
                          )
                      })}
                  </tbody>
              </table>
          </div>

          <div className="border-4 border-red-800 p-4 mt-8 bg-red-50/30 text-center">
              <h3 className="text-sm uppercase font-bold text-red-900 mb-1">Total Outstanding Amount</h3>
              <p className="text-3xl font-black text-red-700">{totalPending.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>

          <div className="absolute bottom-10 left-10 right-10 flex justify-between">
              <div className="text-center">
                  <div className="w-32 border-b border-gray-400 mb-1"></div>
                  <p className="text-[9px] uppercase font-bold">Accounts Officer</p>
              </div>
          </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: `window.onload = function() { window.print(); }` }} />
    </>
  );
}
