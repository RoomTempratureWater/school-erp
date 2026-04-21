"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

export const StatsCard = () => {
  const [count, setCount] = useState(0);

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 p-4 h-full")}>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Active Registrations</p>
      <h2 className="text-4xl font-bold text-monolith-navy tracking-tight">{count}</h2>
      <div className="flex gap-2">
        <button 
          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200"
          onClick={() => setCount((prev) => prev - 1)}
        >-</button>
        <button 
          className="w-8 h-8 rounded-full bg-monolith-navy flex items-center justify-center font-bold text-white hover:bg-monolith-sidebar-hover"
          onClick={() => setCount((prev) => prev + 1)}
        >+</button>
      </div>
    </div>
  );
};
