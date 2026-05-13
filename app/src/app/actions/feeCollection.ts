"use server";

import { prisma } from "@/lib/prisma";

export interface FeeCollectionByMode {
  mode: string;
  label: string;
  amount: number;
  count: number;
}

export interface FeeCollectionData {
  byMode: FeeCollectionByMode[];
  total: number;
  totalCount: number;
  startDate: string;
  endDate: string;
}

const MODE_LABELS: Record<string, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CHEQUE: "Cheque",
  BANK_TRANSFER: "Bank Tx",
};

/**
 * Fetches fee collection analytics grouped by payment method
 * within an optional date range.
 */
export async function getFeeCollectionData(
  startDate?: string,
  endDate?: string
): Promise<FeeCollectionData> {
  // Default: current date
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const start = startDate ? new Date(startDate) : new Date(todayStr);
  const end = endDate ? new Date(endDate + "T23:59:59.999Z") : new Date(todayStr + "T23:59:59.999Z");

  const transactions = await prisma.paymentTransaction.findMany({
    where: {
      paymentDate: {
        gte: start,
        lte: end,
      },
    },
    select: {
      amount: true,
      paymentMethod: true,
    },
  });

  // Aggregate by payment method
  const modeMap: Record<string, { amount: number; count: number }> = {};

  // Initialize all modes so we always show all bars
  for (const mode of Object.keys(MODE_LABELS)) {
    modeMap[mode] = { amount: 0, count: 0 };
  }

  let total = 0;
  let totalCount = 0;

  transactions.forEach((tx) => {
    const method = tx.paymentMethod;
    if (!modeMap[method]) {
      modeMap[method] = { amount: 0, count: 0 };
    }
    modeMap[method].amount += tx.amount;
    modeMap[method].count += 1;
    total += tx.amount;
    totalCount += 1;
  });

  const byMode: FeeCollectionByMode[] = Object.entries(modeMap).map(
    ([mode, data]) => ({
      mode,
      label: MODE_LABELS[mode] || mode,
      amount: Math.round(data.amount * 100) / 100,
      count: data.count,
    })
  );

  return {
    byMode,
    total: Math.round(total * 100) / 100,
    totalCount,
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}
