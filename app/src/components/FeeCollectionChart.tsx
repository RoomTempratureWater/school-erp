"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { IndianRupee, TrendingUp, Calendar, Filter } from "lucide-react";
import { getFeeCollectionData, FeeCollectionData } from "@/app/actions/feeCollection";

// Color palette for payment modes — vibrant, distinct, monolith-aligned
const MODE_COLORS: Record<string, string> = {
  CASH: "#22c55e",        // emerald/green
  UPI: "#6366f1",         // indigo/primary
  CHEQUE: "#f59e0b",      // amber
  BANK_TRANSFER: "#06b6d4", // cyan
};

const MODE_GRADIENTS: Record<string, string> = {
  CASH: "linear-gradient(180deg, #22c55e 0%, #16a34a 100%)",
  UPI: "linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)",
  CHEQUE: "linear-gradient(180deg, #f59e0b 0%, #d97706 100%)",
  BANK_TRANSFER: "linear-gradient(180deg, #06b6d4 0%, #0891b2 100%)",
};

interface FeeCollectionChartProps {
  initialData: FeeCollectionData;
}

export function FeeCollectionChart({ initialData }: FeeCollectionChartProps) {
  const [data, setData] = React.useState<FeeCollectionData>(initialData);
  const [startDate, setStartDate] = React.useState(initialData.startDate);
  const [endDate, setEndDate] = React.useState(initialData.endDate);
  const [loading, setLoading] = React.useState(false);
  const [animationKey, setAnimationKey] = React.useState(0);

  const handleFilter = async () => {
    setLoading(true);
    try {
      const result = await getFeeCollectionData(startDate, endDate);
      setData(result);
      setAnimationKey((k) => k + 1); // Re-trigger bar animation
    } catch (err) {
      console.error("Failed to fetch fee collection data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Find the maximum value to normalize bar heights
  const maxAmount = React.useMemo(() => {
    return data.byMode.reduce(
      (max, item) => (item.amount > max ? item.amount : max),
      0
    );
  }, [data.byMode]);

  // Framer Motion variants
  const chartVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const barVariants = {
    hidden: { scaleY: 0, opacity: 0, transformOrigin: "bottom" },
    visible: {
      scaleY: 1,
      opacity: 1,
      transformOrigin: "bottom",
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val.toLocaleString()}`;
  };

  return (
    <section
      className="lg:col-span-5 rounded-2xl p-6 md:p-8 flex flex-col h-[450px] border border-slate-100 shadow-sm overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)",
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <IndianRupee className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Fee Collection
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">By payment mode</p>
          </div>
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all hover:border-slate-300 w-[130px]"
            />
          </div>
          <span className="text-xs text-slate-300 font-medium">to</span>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all hover:border-slate-300 w-[130px]"
            />
          </div>
          <button
            onClick={handleFilter}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-lg px-3 py-1.5 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <Filter className="w-3 h-3" />
            {loading ? "..." : "Apply"}
          </button>
        </div>
      </div>

      {/* Total & Chart */}
      <div className="flex flex-col flex-1 mt-5">
        {/* Total Value + Trend */}
        <div className="flex items-end gap-4 mb-1">
          <div className="flex flex-col">
            <p className="text-4xl md:text-5xl font-bold tracking-tighter text-monolith-navy">
              ₹{data.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs text-slate-400 font-medium">
                {data.totalCount} transaction{data.totalCount !== 1 ? "s" : ""} in
                selected period
              </span>
            </div>
          </div>
        </div>

        {/* Bar Chart Area */}
        {data.total === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-medium">
            No fee collections recorded in this period.
          </div>
        ) : (
          <motion.div
            key={animationKey}
            className="flex h-full w-full items-end justify-around gap-2 mt-4 pt-4 flex-1"
            variants={chartVariants}
            initial="hidden"
            animate="visible"
            aria-label="Fee collection by payment mode"
          >
            {data.byMode.map((item) => {
              const heightPercent =
                maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;

              return (
                <div
                  key={item.mode}
                  className="flex h-full w-full flex-col items-center justify-end gap-2 group"
                  role="presentation"
                >
                  {/* Amount label above bar */}
                  <motion.span
                    className="text-[11px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    {item.amount > 0 ? formatCurrency(item.amount) : "—"}
                  </motion.span>

                  {/* Bar */}
                  <motion.div
                    className="w-full max-w-[56px] rounded-xl relative overflow-hidden cursor-default"
                    style={{
                      height: `${Math.max(heightPercent, item.amount > 0 ? 8 : 3)}%`,
                      background:
                        item.amount > 0
                          ? MODE_GRADIENTS[item.mode] || MODE_COLORS[item.mode] || "#94a3b8"
                          : "#e2e8f0",
                      boxShadow:
                        item.amount > 0
                          ? `0 4px 14px ${MODE_COLORS[item.mode] || "#94a3b8"}40`
                          : "none",
                    }}
                    variants={barVariants}
                    whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
                    aria-label={`${item.label}: ₹${item.amount.toLocaleString()}`}
                  >
                    {/* Shine effect */}
                    <div
                      className="absolute inset-0 opacity-20 rounded-xl"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                      }}
                    />
                  </motion.div>

                  {/* Label below bar */}
                  <div className="flex flex-col items-center gap-0.5 mt-1">
                    <span className="text-xs font-semibold text-slate-600">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.count} txn{item.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
