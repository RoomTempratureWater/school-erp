import { getGeneralReceipts } from '../actions/receipt-actions';
import DownloadCSV from "@/components/DownloadCSV";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function GeneralReceiptsPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const search = searchParams.search;
  const startDate = searchParams.startDate;
  const endDate = searchParams.endDate;

  const result = await getGeneralReceipts({ search, startDate, endDate });
  const receipts = result.success ? result.data : [];

  // Flatten the receipt data for CSV download
  const csvData = receipts.map((r: any) => ({
    "Receipt No": r.receiptNumber,
    "Date": new Date(r.date).toLocaleDateString(),
    "Title": r.title,
    "Received From": r.receivedFromName,
    "Phone": r.receivedFromPhone || "-",
    "PAN": r.receivedFromPan || "-",
    "Amount": r.amount,
    "Payment Method": r.paymentMethod,
    "Reference": r.paymentReference || "-"
  }));

  async function searchAction(formData: FormData) {
    "use server";
    const q = formData.get("q") as string;
    const sd = formData.get("startDate") as string;
    const ed = formData.get("endDate") as string;
    
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    if (sd) params.set("startDate", sd);
    if (ed) params.set("endDate", ed);
    
    redirect(`/general-receipts?${params.toString()}`);
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">General Receipts</h1>
            <p className="text-slate-500 text-sm mt-1">Manage non-fee receipts like scrap sales, donations, etc.</p>
          </div>
          <div className="flex gap-4">
            <DownloadCSV data={csvData} filename={`general_receipts_${new Date().toISOString().split('T')[0]}.csv`} />
            <Link
              href="/general-receipts/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center"
            >
              + New Receipt
            </Link>
          </div>
        </div>

        <form action={searchAction} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-end shadow-sm mb-6">
          <div className="space-y-1 flex-1 w-full">
            <label className="text-xs font-medium text-slate-500">Search</label>
            <Input name="q" placeholder="Title, Name, or Receipt No" defaultValue={search} className="bg-white" />
          </div>
          <div className="space-y-1 w-full md:w-48">
            <label className="text-xs font-medium text-slate-500">Start Date</label>
            <Input type="date" name="startDate" defaultValue={startDate} className="bg-white" />
          </div>
          <div className="space-y-1 w-full md:w-48">
            <label className="text-xs font-medium text-slate-500">End Date</label>
            <Input type="date" name="endDate" defaultValue={endDate} className="bg-white" />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button type="submit" className="w-full md:w-24 bg-slate-800 hover:bg-slate-700 text-white">Filter</Button>
            <Link href="/general-receipts" className="w-full md:w-24 text-center items-center flex justify-center bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 rounded-md text-sm font-medium h-9">Reset</Link>
          </div>
        </form>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Receipt No</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Title</th>
                  <th className="p-4 font-semibold">Received From</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Payment Method</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {receipts?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No general receipts found.
                    </td>
                  </tr>
                )}
                {receipts?.map((receipt: any) => (
                  <tr key={receipt.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-medium text-blue-600">{receipt.receiptNumber}</td>
                    <td className="p-4 text-slate-600">
                      {new Date(receipt.date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-4 text-slate-800 font-medium">{receipt.title}</td>
                    <td className="p-4 text-slate-600">
                      <div>{receipt.receivedFromName}</div>
                      {receipt.receivedFromPhone && (
                        <div className="text-xs text-slate-400">{receipt.receivedFromPhone}</div>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      ₹{receipt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {receipt.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/general-receipts/${receipt.id}/print`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        target="_blank"
                      >
                        Print
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
