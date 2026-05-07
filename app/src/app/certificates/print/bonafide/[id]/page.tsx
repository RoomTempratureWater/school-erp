import { getCertificateById } from "../../../actions";
import { notFound } from "next/navigation";
import AutoPrint from '@/components/AutoPrint';

function dobToWords(date: Date) {
  const days = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth', 'Twenty First', 'Twenty Second', 'Twenty Third', 'Twenty Fourth', 'Twenty Fifth', 'Twenty Sixth', 'Twenty Seventh', 'Twenty Eighth', 'Twenty Ninth', 'Thirtieth', 'Thirty First'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function getYearWords(y: number) {
     if (y < 2000 || y >= 2100) return y.toString();
     const rem = y - 2000;
     let w = 'Two Thousand';
     if (rem === 0) return w;
     w += ' ';
     if (rem < 20) w += ones[rem];
     else {
        w += tens[Math.floor(rem/10)];
        if (rem % 10 > 0) w += ' ' + ones[rem % 10];
     }
     return w;
  }

  const d = date.getDate();
  const m = date.getMonth();
  const y = date.getFullYear();

  return `${days[d-1]} ${months[m]} ${getYearWords(y)}`;
}

export default async function PrintBonafidePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = parseInt(params.id, 10);
  
  if (isNaN(id)) return notFound();

  const cert = await getCertificateById(id);
  if (!cert || cert.type !== 'BONAFIDE') return notFound();

  const { student } = cert;
  
  const dobWords = dobToWords(student.dateOfBirth);
  
  // Format dates
  const dobFormatted = student.dateOfBirth.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const issuedDateFormatted = cert.issuedAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // Academic year heuristic based on issuedAt
  const issueYear = cert.issuedAt.getFullYear();
  const issueMonth = cert.issuedAt.getMonth() + 1;
  const academicYear = issueMonth >= 4 ? `${issueYear}-${(issueYear+1).toString().slice(2)}` : `${issueYear-1}-${issueYear.toString().slice(2)}`;

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
        .filled-data {
            color: #8b1a1a;
            font-style: italic;
            font-weight: bold;
        }
        .border-dotted-custom {
            border-bottom: 1px dotted #9ca3af;
        }
      `}} />

      <div className="receipt-container text-gray-800">
          
          <div className="text-center mb-4">
              <div className="flex justify-center mb-1">
                  <svg width="40" height="32" viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M25 5C15 5 10 15 10 25C10 35 25 38 25 38C25 38 40 35 40 25C40 15 35 5 25 5Z" stroke="black" strokeWidth="2"/>
                      <path d="M25 5V15M20 10H30" stroke="black" strokeWidth="1.5"/>
                  </svg>
              </div>
              <p className="text-[10px] uppercase tracking-widest font-bold">The SSMVI</p>
              <h1 className="text-2xl font-bold tracking-wide leading-tight">Epiphany School</h1>
              <p className="text-[11px] font-semibold">5, Guruwar Peth, Panch Howd, Pune - 411042</p>
              <p className="text-[10px]">Ph: 24467524</p>
          </div>

          <div className="text-center mb-4">
              <span className="font-bold text-sm">Year:</span>
              <span className="text-sm border-b border-black px-2">{academicYear}</span>
          </div>

          <div className="text-center mb-6">
              <h2 className="text-xl font-black border-b-2 border-black inline-block px-4 pb-0.5">BONAFIDE CERTIFICATE</h2>
          </div>

          <div className="flex justify-between items-center mb-6 px-2 text-sm">
              <div>
                  <span className="font-bold">Receipt No:</span>
                  <span className="filled-data ml-1">{cert.id}</span>
              </div>
              <div>
                  <span className="font-bold">Date of Issue:</span>
                  <span className="filled-data ml-1">{issuedDateFormatted}</span>
              </div>
          </div>

          <div className="space-y-4 px-2 text-[14px] leading-relaxed">
              <div>
                  <p className="font-semibold italic">This is to certify that Master/Miss:</p>
                  <div className="text-lg font-bold filled-data border-dotted-custom pb-1 mt-1">
                      {student.firstName} {student.lastName}
                  </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-2">
                  <span className="font-semibold italic">is a bonafide student of this school, studying in Std:</span>
                  <span className="filled-data text-md">{student.standard} {student.division}</span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2">
                  <span className="font-semibold italic">His / Her Date of birth according to our Register is:</span>
                  <span className="filled-data">{dobFormatted}</span>
              </div>

              <div className="flex flex-col gap-1">
                  <span className="font-semibold italic">In Words:</span>
                  <span className="text-gray-700 font-medium italic border-dotted-custom">{dobWords}</span>
              </div>

              <p className="font-bold pt-1">He / She bears a good moral character.</p>

              <div className="flex items-center gap-x-2">
                  <span className="font-semibold italic">His / Her place of birth is:</span>
                  <span className="filled-data">-----</span>
              </div>

              <div className="flex items-center gap-x-2">
                  <span className="font-semibold italic">and his / her caste is:</span>
                  <span className="filled-data">-----</span>
              </div>
          </div>

          <div className="absolute bottom-12 right-10 text-center">
              <div className="h-12"></div> <div className="w-32 border-t-2 border-gray-900 mb-1"></div>
              <p className="font-bold text-sm uppercase">Principal</p>
              <p className="text-[9px] text-gray-500">Epiphany School, Pune</p>
          </div>

      </div>

      {/* Auto-Trigger Print */}
      <AutoPrint />
    </>
  );
}
