import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 p-8 w-full">
      <div className="mx-auto max-w-6xl space-y-8 w-full">
        <div className="flex sm:flex-row flex-col items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-1">Welcome back, Administrator. Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline">Download Report</Button>
            <Button>Add New Student</Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 transition-all hover:shadow-md">
            <div className="flex flex-row items-center justify-between pb-2 space-y-0">
               <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Students</h3>
            </div>
            <div className="text-3xl font-bold text-foreground">2,450</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium"><span className="text-emerald-600">+180</span> from last month</p>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 transition-all hover:shadow-md">
            <div className="flex flex-row items-center justify-between pb-2 space-y-0">
               <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Teachers</h3>
            </div>
            <div className="text-3xl font-bold text-foreground">142</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium"><span className="text-emerald-600">+4</span> from last month</p>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 transition-all hover:shadow-md">
            <div className="flex flex-row items-center justify-between pb-2 space-y-0">
               <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Revenue (Monthly)</h3>
            </div>
            <div className="text-3xl font-bold text-foreground">$124,500</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium"><span className="text-emerald-600">+12%</span> from last month</p>
          </div>
        </div>

        <div className="rounded-xl border bg-white shadow-sm h-96 flex flex-col items-center justify-center p-6 text-center text-muted-foreground transition-all hover:shadow-md">
          <div className="bg-slate-100 p-4 rounded-full mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart-3"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">Chart Area</h3>
          <p className="text-sm mt-1 max-w-[200px]">Install chart library like Recharts to populate analytics here</p>
        </div>
      </div>
    </main>
  );
}
