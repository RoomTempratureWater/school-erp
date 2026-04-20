"use client";

import { Button } from "@/components/ui/button";

export default function DownloadCSV({ data, filename }: { data: any[], filename: string }) {
  const handleDownload = () => {
    if (!data || !data.length) return;
    
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(obj => 
      Object.values(obj).map(val => {
         if (val === null || val === undefined) return '""';
         let str = String(val);
         if (str.includes(',') || str.includes('"')) {
            str = `"${str.replace(/"/g, '""')}"`;
         }
         return str;
      }).join(",")
    ).join("\n");

    const blob = new Blob([headers + "\n" + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button onClick={handleDownload} variant="outline" className="shrink-0 bg-white shadow-sm">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
      Download CSV
    </Button>
  );
}
