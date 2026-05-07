import { getCertificates } from './actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import CreateCertificateDialog from './CreateCertificateDialog';

export default async function CertificatesPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const name = searchParams.name;
  const standard = searchParams.standard;
  const date = searchParams.date;

  const certificates = await getCertificates({ name, standard, date });

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 w-full">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
            <p className="text-muted-foreground mt-1 text-sm">Track and generate student certificates.</p>
          </div>
          <CreateCertificateDialog />
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search by student name, standard, or issue date.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/certificates" method="GET" className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Student Name</label>
                <Input name="name" defaultValue={name || ""} placeholder="Search..." />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Standard</label>
                <select 
                  name="standard" 
                  defaultValue={standard || ""}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">All Standards</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={String(i + 1)}>Std {i + 1}</option>
                  ))}
                  <option value="UKG">UKG</option>
                  <option value="LKG">LKG</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Issue Date</label>
                <Input name="date" type="date" defaultValue={date || ""} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Apply Filters</Button>
                {(name || standard || date) && (
                  <Link href="/certificates" className="flex-1">
                    <Button variant="outline" type="button" className="w-full">Clear</Button>
                  </Link>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Issued Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            {certificates.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <p>No certificates found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Standard</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Issued At</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium">
                        {cert.student.firstName} {cert.student.lastName}
                        <div className="text-[10px] text-muted-foreground">{cert.student.enrollmentNo}</div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800">
                          {cert.student.standard}-{cert.student.division}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          cert.type === 'BONAFIDE' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {cert.type === 'BONAFIDE' ? 'Bonafide' : 'Leaving Cert.'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {cert.issuedAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link 
                          href={`/certificates/print/${cert.type === 'BONAFIDE' ? 'bonafide' : 'lc'}/${cert.id}`} 
                          target="_blank"
                        >
                          <Button variant="ghost" size="sm">Print</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
