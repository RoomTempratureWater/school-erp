"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, BarChart, Bar } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { InteractiveLogsTable } from "@/components/InteractiveLogsTable";
import { EventCalendar, CalendarEvent } from "@/components/EventCalendar";

import SchoolYearFilter from "@/components/SchoolYearFilter";

const feeChartConfig = {
  fee: {
    label: "Pending Fees (₹)",
    color: "#6366f1", // monolith-accent-blue
  },
};

const initialEvents: CalendarEvent[] = [
  { id: "1", title: "Faculty Senate Meeting", date: new Date().toISOString() },
  { id: "2", title: "G12 Graduation Rehearsal", date: new Date(Date.now() + 86400000 * 2).toISOString() },
];

interface DashboardClientProps {
  auditLogs: any[];
  academicYears: { id: number; name: string; isCurrent: boolean }[];
  activeYearId: number | null;
  pendingFeesData: { standard: string; fee: number }[];
  performanceData: Record<string, any[]>;
  totalPendingFees: number;
  diskUsage: { usedBytes: number; totalBytes: number; usedPercent: number };
}

export function DashboardClient({
  auditLogs,
  academicYears,
  activeYearId,
  pendingFeesData,
  performanceData,
  totalPendingFees,
  diskUsage
}: DashboardClientProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);

  const availableStandards = Object.keys(performanceData);
  const defaultStandard = availableStandards.length > 0 ? availableStandards[0] : "";
  const [selectedStandard, setSelectedStandard] = useState<string>(defaultStandard);

  const currentPerformance = performanceData[selectedStandard] || [];
  const averagePerformance = currentPerformance.length > 0
    ? currentPerformance.reduce((acc, curr) => acc + curr.average, 0) / currentPerformance.length
    : 0;

  return (
    <main className="flex-1 overflow-y-auto bg-monolith-bg p-6 md:p-8 w-full block">
      <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6">

        {/* Academic Year Filter */}
        <div className="lg:col-span-12 flex justify-end">
          <SchoolYearFilter
            academicYears={academicYears}
            currentYearId={activeYearId}
          />
        </div>

        {/* ROW 1 */}
        {/* 1. Pending Fees Line Chart Card */}
        <section className="lg:col-span-8 bg-slate-200/50 rounded-2xl p-6 md:p-8 flex flex-col justify-between h-[450px]">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending School Fees</p>
                <h3 className="text-4xl md:text-5xl font-bold mt-2 text-monolith-navy tracking-tight">₹{totalPendingFees.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                <div className="flex items-center gap-2 mt-4">
                  {/* Dynamic metric change logic can go here later */}
                  <span className="text-xs text-slate-400 font-medium">for selected academic year</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 mt-8 w-full h-[250px] -ml-4">
            {pendingFeesData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                No pending fees available for this academic year.
              </div>
            ) : (
              <ChartContainer config={feeChartConfig} className="w-full h-full">
                <LineChart data={pendingFeesData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
                  <XAxis dataKey="standard" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dx={-10} tickFormatter={(val) => `₹${val / 1000}k`} />
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
            )}
          </div>
        </section>

        {/* 2. Custom Aesthetic Performance Matrix */}
        <section className="lg:col-span-4 bg-[#18181b] rounded-2xl p-6 md:p-8 flex flex-col justify-between h-[450px] shadow-sm text-white">
          <div className="flex flex-col h-full relative">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h4 className="text-[13px] font-semibold text-slate-300">Overall Standard Performance</h4>
              {availableStandards.length > 0 ? (
                <select
                  className="text-xs font-bold text-slate-200 bg-white/10 border border-white/10 rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-monolith-accent-blue hover:bg-white/20 transition cursor-pointer"
                  value={selectedStandard}
                  onChange={(e) => setSelectedStandard(e.target.value)}
                >
                  {availableStandards.map((std) => (
                    <option key={std} className="bg-slate-800 text-white" value={std}>{std}</option>
                  ))}
                </select>
              ) : null}
            </div>

            {availableStandards.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm font-medium">
                No exam data available for this year.
              </div>
            ) : (
              <>
                <div className="mt-6 border-b border-slate-700/60 pb-8">
                  <div className="flex items-baseline gap-4">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                      {averagePerformance.toFixed(1)}%
                    </h1>
                  </div>
                </div>

                <div className="mt-8 flex-1 flex flex-col">
                  <div className="flex gap-2 w-full mt-auto">
                    {currentPerformance.map((subjectData) => (
                      <div key={subjectData.subject} className="flex flex-col" style={{ width: `${subjectData.average}%` }}>
                        <div className="h-1.5 w-full rounded-full mb-3" style={{ backgroundColor: subjectData.fill }}></div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1 mt-1 truncate" title={subjectData.subject}>{subjectData.subject}</span>
                        <span className="text-sm font-bold text-white">{subjectData.average}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
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
        {(() => {
          const pct = Math.round(diskUsage.usedPercent);
          const pieColor = pct >= 90 ? '#ef4444' : pct >= 70 ? '#eab308' : '#22c55e';
          const formatBytes = (bytes: number) => {
            if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(1)} TB`;
            if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
            if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
            return `${bytes} B`;
          };
          return (
            <section className="lg:col-span-3 bg-white rounded-2xl p-6 md:p-8 border border-slate-100 h-[450px] flex flex-col items-center justify-center text-center">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 w-full text-left">Cloud Infrastructure</h4>
              <div className="relative w-36 h-36 flex items-center justify-center mb-8 shrink-0 mt-4">
                <div className="absolute inset-0 rounded-full p-4" style={{ background: `conic-gradient(${pieColor} ${pct}%, #e5e7eb 0deg)` }}>
                  <div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                    <span className="text-3xl font-black" style={{ color: pieColor }}>{pct}%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Used</span>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm font-bold text-monolith-navy">{formatBytes(diskUsage.usedBytes)} of {formatBytes(diskUsage.totalBytes)} used</p>
                <p className="text-[10px] text-slate-400 mt-1">Server Disk Usage (/)</p>
              </div>
            </section>
          );
        })()}

      </div>
    </main>
  );
}
