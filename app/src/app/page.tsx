import { prisma } from '@/lib/prisma';
import { DashboardClient } from './DashboardClient';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export default async function Dashboard(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const yearIdParam = searchParams.yearId;

  const academicYears = await prisma.academicYear.findMany({ orderBy: { createdAt: 'desc' } });
  const currentYear = academicYears.find(ay => ay.isCurrent) || academicYears[0] || null;
  const activeYearId = yearIdParam ? parseInt(yearIdParam, 10) : (currentYear?.id || null);

  const rawLogs = await prisma.auditLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: 100,
    include: { internalUser: true }
  });

  const auditLogs = rawLogs.map((log) => ({
    id: log.id.toString(),
    timestamp: log.timestamp.toISOString(),
    level: log.action === 'DELETE' ? 'error' : log.action === 'UPDATE' ? 'warning' : 'info',
    service: log.tableName,
    message: `${log.action} performed on ${log.tableName}`,
    userId: log.internalUser?.userid || 'System/Unknown',
    status: log.action.toLowerCase(),
    tags: [log.action.toLowerCase(), log.tableName],
    changedData: log.changedData ? JSON.stringify(log.changedData, null, 2) : 'No data changes recorded',
  }));

  // 2. Pending Fees Data
  let pendingFeesData: { standard: string; fee: number }[] = [];
  let totalPendingFees = 0;

  if (activeYearId) {
    const pendingFees = await prisma.studentFee.findMany({
      where: {
        status: { not: "PAID" },
        feeCategory: { academicYearId: activeYearId }
      },
      select: { amountDue: true, amountPaid: true, studentStandard: true, student: { select: { standard: true } } }
    });

    const feeMap: Record<string, number> = {};
    pendingFees.forEach(fee => {
      const standard = fee.studentStandard || fee.student?.standard || "Unknown";
      const pending = fee.amountDue - fee.amountPaid;
      if (pending > 0) {
        feeMap[standard] = (feeMap[standard] || 0) + pending;
        totalPendingFees += pending;
      }
    });

    pendingFeesData = Object.entries(feeMap)
      .map(([standard, fee]) => ({ standard: `Std ${standard}`, fee }))
      .sort((a, b) => {
        // Natural sort for standards like Std 8, Std 9, Std 10
        const numA = parseInt(a.standard.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.standard.replace(/\D/g, '')) || 0;
        return numA - numB;
      });
  }

  // 3. Exam Performance Data
  const performanceData: Record<string, any[]> = {};

  if (activeYearId) {
    const marks = await prisma.mark.findMany({
      where: {
        exam: { academicYearId: activeYearId }
      },
      include: { exam: true }
    });

    const marksMap: Record<string, Record<string, { totalObtained: number; totalMax: number }>> = {};

    marks.forEach(mark => {
      const standard = `Std ${mark.exam.standard}`;
      if (!marksMap[standard]) marksMap[standard] = {};
      if (!marksMap[standard][mark.subject]) {
        marksMap[standard][mark.subject] = { totalObtained: 0, totalMax: 0 };
      }
      marksMap[standard][mark.subject].totalObtained += mark.marksObtained;
      marksMap[standard][mark.subject].totalMax += mark.maxMarks;
    });

    // Aesthetic color palette
    const colors = ["#ffffff", "#8b5cf6", "#3b82f6", "#d946ef", "#10b981", "#f59e0b", "#ef4444"];

    Object.entries(marksMap).forEach(([standard, subjects]) => {
      performanceData[standard] = Object.entries(subjects).map(([subject, totals], index) => ({
        subject,
        average: totals.totalMax > 0 ? parseFloat(((totals.totalObtained / totals.totalMax) * 100).toFixed(1)) : 0,
        fill: colors[index % colors.length]
      }));
    });
  }

  // 4. Disk Usage Data
  let diskUsage = { usedBytes: 0, totalBytes: 0, usedPercent: 0 };
  try {
    const { stdout } = await execFileAsync("df", ["-B1", "/"]);
    const lines = stdout.trim().split("\n");
    if (lines.length >= 2) {
      const parts = lines[1].split(/\s+/);
      // df -B1 output: Filesystem 1B-blocks Used Available Use% Mounted
      const totalBytes = parseInt(parts[1], 10) || 0;
      const usedBytes = parseInt(parts[2], 10) || 0;
      const usedPercent = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;
      diskUsage = { usedBytes, totalBytes, usedPercent };
    }
  } catch (err) {
    console.error("Failed to get disk usage:", err);
  }

  return (
    <DashboardClient
      auditLogs={auditLogs}
      academicYears={academicYears}
      activeYearId={activeYearId}
      pendingFeesData={pendingFeesData}
      performanceData={performanceData}
      totalPendingFees={totalPendingFees}
      diskUsage={diskUsage}
    />
  );
}
