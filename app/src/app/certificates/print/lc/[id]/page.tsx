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

export default async function PrintLeavingCertificatePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = parseInt(params.id, 10);
  
  if (isNaN(id)) return notFound();

  const cert = await getCertificateById(id);
  if (!cert || cert.type !== 'LEAVING') return notFound();

  const { student } = cert;
  
  const dobWords = dobToWords(student.dateOfBirth);
  
  // Format dates
  const dobFormatted = student.dateOfBirth.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const issuedDateFormatted = cert.issuedAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const admissionDateFormatted = student.createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

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
            padding: 8mm;
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
            font-size: 0.85rem;
        }
        .label {
            font-weight: bold;
            color: #1f2937;
            font-size: 0.75rem;
        }
        .border-dotted-b {
            border-bottom: 1px dotted #9ca3af;
        }
      `}} />

      <div className="receipt-container text-gray-800">
          
          <div className="text-center mb-2">
              <div className="flex justify-center mb-1">
                  <svg width="35" height="28" viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M25 5C15 5 10 15 10 25C10 35 25 38 25 38C25 38 40 35 40 25C40 15 35 5 25 5Z" stroke="black" strokeWidth="2"/>
                      <path d="M25 5V15M20 10H30" stroke="black" strokeWidth="1.5"/>
                  </svg>
              </div>
              <p className="text-[9px] uppercase tracking-widest font-bold leading-tight">The SSMVI</p>
              <h1 className="text-xl font-bold tracking-wide">Epiphany School</h1>
              <p className="text-[10px] font-semibold">5, Guruwar Peth, Panch Howd, Pune - 411042</p>
              <p className="text-[9px]">Ph: 24467524 | Recognition No: 1497</p>
          </div>

          <div className="text-center mb-3">
              <h2 className="text-sm font-bold border-b-2 border-black inline-block px-4 pb-0.5">SCHOOL LEAVING CERTIFICATE</h2>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-2 border-b border-gray-100 pb-1">
              <div><span className="label">Sr No:</span> <span className="filled-data ml-1">{cert.id}</span></div>
              <div><span className="label">Reg No:</span> <span className="filled-data ml-1">{student.enrollmentNo}</span></div>
              <div><span className="label">Aadhar:</span> <span className="filled-data ml-1">-----</span></div>
          </div>

          <div className="mb-2">
              <span className="label">Saral ID / PEN:</span>
              <span className="filled-data ml-1">-----</span>
          </div>

          <div className="grid grid-cols-4 gap-1 mb-2 text-center bg-gray-50 p-1 border-y border-gray-200">
              <div><p className="label text-[8px] uppercase">First Name</p><p className="filled-data">{student.firstName}</p></div>
              <div><p className="label text-[8px] uppercase">Middle Name</p><p className="filled-data">-----</p></div>
              <div><p className="label text-[8px] uppercase">Last Name</p><p className="filled-data">{student.lastName}</p></div>
              <div><p className="label text-[8px] uppercase">Mother Name</p><p className="filled-data">{student.parentName || '-----'}</p></div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
              <div className="flex items-center border-dotted-b"><span className="label w-20">Nationality:</span><span className="filled-data">Indian</span></div>
              <div className="flex items-center border-dotted-b"><span className="label w-20">Tongue:</span><span className="filled-data">-----</span></div>
              <div className="flex items-center border-dotted-b"><span className="label w-20">Religion:</span><span className="filled-data">-----</span></div>
              <div className="flex items-center border-dotted-b"><span className="label w-12">Caste:</span><span className="filled-data">-----</span></div>
          </div>

          <div className="mb-2 p-1 border border-gray-100 rounded">
              <p className="label text-[9px] mb-1">Place of Birth:</p>
              <div className="grid grid-cols-5 gap-1 text-center">
                  <div><p className="text-[8px] italic">City</p><p className="filled-data text-[10px]">-----</p></div>
                  <div><p className="text-[8px] italic">Taluka</p><p className="filled-data text-[10px]">-----</p></div>
                  <div><p className="text-[8px] italic">Dist.</p><p className="filled-data text-[10px]">-----</p></div>
                  <div><p className="text-[8px] italic">State</p><p className="filled-data text-[10px]">-----</p></div>
                  <div><p className="text-[8px] italic">Country</p><p className="filled-data text-[10px]">-----</p></div>
              </div>
          </div>

          <div className="space-y-1.5 mb-2">
              <div className="flex border-dotted-b">
                  <span className="label w-44">Date Of Birth:</span>
                  <span className="filled-data">{dobFormatted}</span>
              </div>
              <div className="flex border-dotted-b">
                  <span className="label w-44">In Words:</span>
                  <span className="filled-data text-[10px]">{dobWords}</span>
              </div>
              <div className="flex border-dotted-b">
                  <span className="label w-44">Previous School:</span>
                  <span className="filled-data text-[10px]">-----</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="flex border-dotted-b"><span className="label w-32">Admission:</span><span className="filled-data">{admissionDateFormatted}</span></div>
                  <div className="flex border-dotted-b"><span className="label w-16">Std:</span><span className="filled-data">{student.standard}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                  <div className="flex border-dotted-b"><span className="label w-20">Progress:</span><span className="filled-data">Good</span></div>
                  <div className="flex border-dotted-b"><span className="label w-20">Behavior:</span><span className="filled-data">Good</span></div>
              </div>
              <div className="flex border-dotted-b">
                  <span className="label w-44">Date of Leaving School:</span>
                  <span className="filled-data">{issuedDateFormatted}</span>
              </div>
              <div className="flex border-dotted-b">
                  <span className="label w-44">Reason for Leaving School:</span>
                  <span className="filled-data">-----</span>
              </div>
              <div className="flex border-dotted-b">
                  <span className="label w-44">Remark:</span>
                  <span className="filled-data">-----</span>
              </div>
          </div>

          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
              <div className="text-[10px] leading-tight">
                  <p className="label">Place: <span className="font-normal">Pune</span></p>
                  <p className="label">Date: <span className="font-normal">{issuedDateFormatted}</span></p>
              </div>
              <div className="text-center">
                  <div className="w-32 border-b border-gray-400 mb-1"></div>
                  <p className="font-bold text-sm uppercase">Principal</p>
                  <p className="text-[8px] text-gray-500 italic">Seal & Signature</p>
              </div>
          </div>

      </div>

      {/* Auto-Trigger Print */}
      <AutoPrint />
    </>
  );
}
