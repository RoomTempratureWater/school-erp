import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'School ERP - Dashboard',
  description: 'Internal Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} font-sans h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 bg-white sticky top-0 z-50 print:hidden">
          <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
             <div className="size-8 rounded-md bg-primary text-primary-foreground flex flex-col items-center justify-center font-bold">E</div>
             <span>EduManage ERP</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground shrink-0">
            <nav className="hidden md:flex gap-6 items-center">
              <a href="#" className="text-foreground transition-colors hover:text-foreground">Dashboard</a>
              <a href="/school-year-setup" className="transition-colors hover:text-foreground">School Setup</a>
              <a href="/fees" className="transition-colors hover:text-foreground">Fees</a>
              <a href="/promote-students" className="transition-colors hover:text-foreground">Promotions</a>
              <a href="/exam-setup" className="transition-colors hover:text-foreground">Exam Setup</a>
              <a href="/exam-results" className="transition-colors hover:text-foreground">Exam Results</a>
            </nav>
            <div className="size-8 rounded-full bg-muted flex items-center justify-center border font-semibold text-foreground ml-4 shrink-0">
              AD
            </div>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
           {children}
        </div>
      </body>
    </html>
  );
}
