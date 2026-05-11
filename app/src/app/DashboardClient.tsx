"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, BarChart, Bar } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { InteractiveLogsTable } from "@/components/InteractiveLogsTable";
import { EventCalendar, CalendarEvent } from "@/components/EventCalendar";

// --- DUMMY DATA ---
const dummyPendingFeesData = [
  { standard: "Std 1", fee: 12000 },
  { standard: "Std 2", fee: 15500 },
  { standard: "Std 3", fee: 8000 },
  { standard: "Std 4", fee: 22000 },
  { standard: "Std 5", fee: 18500 },
  { standard: "Std 6", fee: 9000 },
  { standard: "Std 7", fee: 11000 },
  { standard: "Std 8", fee: 20000 },
  { standard: "Std 9", fee: 25000 },
  { standard: "Std 10", fee: 32000 },
];
const feeChartConfig = {
  fee: {
    label: "Pending Fees (₹)",
    color: "#6366f1", // monolith-accent-blue
  },
};

type StandardKey = "Std 8" | "Std 9" | "Std 10";
const dummyPerformanceData: Record<StandardKey, any[]> = {
  "Std 10": [
    { subject: "Maths", average: 85, fill: "#ffffff" },
    { subject: "English", average: 92, fill: "#8b5cf6" },
    { subject: "History", average: 70, fill: "#3b82f6" },
    { subject: "Science", average: 75, fill: "#d946ef" },
  ],
  "Std 9": [
    { subject: "Maths", average: 84, fill: "#ffffff" },
    { subject: "English", average: 88, fill: "#8b5cf6" },
    { subject: "History", average: 90, fill: "#3b82f6" },
    { subject: "Science", average: 82, fill: "#d946ef" },
  ],
  "Std 8": [
    { subject: "Maths", average: 81, fill: "#ffffff" },
    { subject: "English", average: 82, fill: "#8b5cf6" },
    { subject: "History", average: 88, fill: "#3b82f6" },
    { subject: "Science", average: 85, fill: "#d946ef" },
  ],
};

const initialEvents: CalendarEvent[] = [
  { id: "1", title: "Faculty Senate Meeting", date: new Date().toISOString() },
  { id: "2", title: "G12 Graduation Rehearsal", date: new Date(Date.now() + 86400000*2).toISOString() },
];

export function DashboardClient({ auditLogs }: { auditLogs: any[] }) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [selectedStandard, setSelectedStandard] = useState<StandardKey>("Std 10");

  return (
    <main className="flex-1 overflow-y-auto bg-monolith-bg p-6 md:p-8 w-full block">
      <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6">
        
        {/* ROW 1 */}
        {/* 1. Pending Fees Line Chart Card */}
        <section className="lg:col-span-8 bg-slate-200/50 rounded-2xl p-6 md:p-8 flex flex-col justify-between h-[450px]">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending School Fees</p>
                <h3 className="text-4xl md:text-5xl font-bold mt-2 text-monolith-navy tracking-tight">₹1,73,000.00</h3>
                <div className="flex items-center gap-2 mt-4">
                  <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded text-xs font-bold">+5.2%</span>
                  <span className="text-xs text-slate-400 font-medium">since last month</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 mt-8 w-full h-[250px] -ml-4">
            <ChartContainer config={feeChartConfig} className="w-full h-full">
              <LineChart data={dummyPendingFeesData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
                <XAxis dataKey="standard" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Line
                  type="monotone"
                  dataKey="fee"
                  stroke="var(--color-fee)"
                  strokeWidth={4}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  className="filter drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                />
              </LineChart>
            </ChartContainer>
          </div>
        </section>

        {/* 2. Custom Aesthetic Performance Matrix (from Screenshot) */}
        <section className="lg:col-span-4 bg-[#18181b] rounded-2xl p-6 md:p-8 flex flex-col justify-between h-[450px] shadow-sm text-white">
          <div className="flex flex-col h-full relative">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h4 className="text-[13px] font-semibold text-slate-300">Overall Standard Performance</h4>
              <select
                className="text-xs font-bold text-slate-200 bg-white/10 border border-white/10 rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-monolith-accent-blue hover:bg-white/20 transition cursor-pointer"
                value={selectedStandard}
                onChange={(e) => setSelectedStandard(e.target.value as StandardKey)}
              >
                <option className="bg-slate-800 text-white" value="Std 8">Std 8</option>
                <option className="bg-slate-800 text-white" value="Std 9">Std 9</option>
                <option className="bg-slate-800 text-white" value="Std 10">Std 10</option>
              </select>
            </div>
            
            <div className="mt-6 border-b border-slate-700/60 pb-8">
               <div className="flex items-baseline gap-4">
                 <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    {(dummyPerformanceData[selectedStandard].reduce((acc, curr) => acc + curr.average, 0) / dummyPerformanceData[selectedStandard].length).toFixed(1)}%
                 </h1>
                 <span className="text-emerald-400 font-semibold text-xs tracking-wider">+4.2%</span>
               </div>
            </div>

            <div className="mt-8 flex-1 flex flex-col">
              <div className="flex gap-2 w-full mt-auto">
                {dummyPerformanceData[selectedStandard].map((subjectData) => (
                  <div key={subjectData.subject} className="flex flex-col" style={{ width: `${subjectData.average}%` }}>
                    <div className="h-1.5 w-full rounded-full mb-3" style={{ backgroundColor: subjectData.fill }}></div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1 mt-1">{subjectData.subject}</span>
                    <span className="text-sm font-bold text-white">{subjectData.average}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ROW 2 */}
        {/* 3. Interactive Logs Table */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm h-[450px] flex flex-col">
          <div className="px-6 py-4 border-b shrink-0">
             <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Audit Logs</h4>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <InteractiveLogsTable initialLogs={auditLogs} />
          </div>
        </section>

        {/* 4. Calendar Component */}
        <section className="lg:col-span-4 bg-white rounded-2xl p-6 md:p-8 border border-slate-100 h-[450px] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Calendar & Events</h4>
          </div>
          <EventCalendar
            events={events}
            onAddEvent={(e) => setEvents([...events, e])}
            onRemoveEvent={(id) => setEvents(events.filter(e => e.id !== id))}
          />
        </section>

        {/* 5. Cloud Infrastructure Storage */}
        <section className="lg:col-span-3 bg-white rounded-2xl p-6 md:p-8 border border-slate-100 h-[450px] flex flex-col items-center justify-center text-center">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 w-full text-left">Cloud Infrastructure</h4>
          <div className="relative w-36 h-36 flex items-center justify-center mb-8 shrink-0 mt-4">
            <div className="absolute inset-0 rounded-full p-4" style={{ background: 'conic-gradient(#00003c 70%, #e5e7eb 0deg)' }}>
              <div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                <span className="text-3xl font-black text-monolith-navy">70%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Used</span>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-sm font-bold text-monolith-navy">1.4 TB of 2 TB used</p>
            <p className="text-[10px] text-slate-400 mt-1">Institutional Storage Quota</p>
          </div>
          <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition shadow-xl shadow-slate-200 mt-auto">
            Upgrade Infrastructure
          </button>
        </section>

      </div>
    </main>
  );
}
