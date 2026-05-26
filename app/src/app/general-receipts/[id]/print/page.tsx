import { getGeneralReceiptById } from '@/app/actions/receipt-actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function PrintGeneralReceiptPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const result = await getGeneralReceiptById(parseInt(params.id, 10));
  
  if (!result.success || !result.data) {
    notFound();
  }

  const receipt = result.data;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-8 print:py-0 print:bg-white">
      {/* Non-printable controls */}
      <div className="w-full max-w-[800px] mb-6 flex justify-between items-center print:hidden px-4">
        <Link href="/general-receipts" className="text-slate-500 hover:text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Receipts
        </Link>
        <button 
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition flex items-center gap-2"
        >
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
           <span className="print-text">Print</span>
        </button>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        document.querySelector('button').addEventListener('click', function() {
          window.print();
        });
      `}} />

      {/* Printable Receipt Paper */}
      <div className="w-full max-w-[800px] bg-white print:w-full print:max-w-none print:shadow-none shadow-xl border border-slate-200 print:border-none aspect-[1/1.414] mx-auto p-12 relative text-slate-800">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <img src="/epiphany-school-logo.jpg" alt="Logo" className="w-20 h-20 object-contain rounded-lg" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight uppercase text-slate-900">Epiphany School</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">5, Guruwar Peth, Panch Howd, Pune - 411042</p>
              <p className="text-sm text-slate-500">Ph: 24467524 | Recognition No: 1497</p>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block px-4 py-2 bg-slate-100 rounded-md border border-slate-200 mb-2">
              <h2 className="text-xl font-bold tracking-widest uppercase text-slate-700">Receipt</h2>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div className="space-y-2">
            <div className="flex">
              <span className="w-32 text-slate-500 font-medium">Receipt No:</span>
              <span className="font-bold">{receipt.receiptNumber}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500 font-medium">Date:</span>
              <span className="font-medium">{new Date(receipt.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex">
              <span className="w-32 text-slate-500 font-medium">Payment Mode:</span>
              <span className="font-medium">{receipt.paymentMethod}</span>
            </div>
            {receipt.paymentMethod !== 'CASH' && (
              <div className="flex">
                <span className="w-32 text-slate-500 font-medium">Reference:</span>
                <span className="font-medium">{receipt.paymentReference}</span>
              </div>
            )}
          </div>
        </div>

        {/* Received From Block */}
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-8">
          <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">Received From</h3>
          <div className="font-bold text-lg mb-1">{receipt.receivedFromName}</div>
          <div className="text-sm text-slate-600 flex gap-6">
            {receipt.receivedFromPhone && <span><span className="text-slate-400">Phone:</span> {receipt.receivedFromPhone}</span>}
            {receipt.receivedFromPan && <span><span className="text-slate-400">PAN:</span> {receipt.receivedFromPan}</span>}
          </div>
        </div>

        {/* Particulars Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-slate-800 text-left">
              <th className="py-3 font-bold uppercase text-sm tracking-wider">Description</th>
              <th className="py-3 font-bold uppercase text-sm tracking-wider text-right w-48">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="py-6 text-lg">{receipt.title}</td>
              <td className="py-6 text-right font-bold text-xl">{receipt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="py-6 text-right font-bold text-lg uppercase pr-6">Total Amount</td>
              <td className="py-6 text-right font-bold text-2xl border-t-2 border-slate-800">
                ₹ {receipt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Footer / Signatures */}
        <div className="absolute bottom-12 left-12 right-12">
          <div className="flex justify-between items-end border-t border-slate-200 pt-8">
            <div className="text-sm text-slate-500">
              <p>This is a computer generated receipt.</p>
              <p>Subject to realization of cheque/draft.</p>
            </div>
            <div className="text-center w-48">
              <div className="border-b-2 border-slate-300 h-16 mb-2"></div>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-600">Authorized Signatory</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
