'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import StudentSearchDropdown from '@/components/StudentSearchDropdown';
import { createCertificate } from './actions';

export default function CreateCertificateDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      const grNo = formData.get('grNo') as string;
      const type = formData.get('type') as string;

      if (!grNo) {
        throw new Error('Please select a student');
      }

      // Call server action
      const certificate = await createCertificate({ grNo, type: type as any });
      
      setOpen(false);
      
      // Navigate to print page
      if (type === 'BONAFIDE') {
        router.push(`/certificates/print/bonafide/${certificate.id}`);
      } else {
        router.push(`/certificates/print/lc/${certificate.id}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Generate Certificate</Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Generate Certificate</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">{error}</div>}
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Student</label>
                <StudentSearchDropdown name="grNo" required />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Certificate Type</label>
                <select 
                  name="type" 
                  required
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="BONAFIDE">Bonafide Certificate</option>
                  <option value="LEAVING">Leaving Certificate</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
