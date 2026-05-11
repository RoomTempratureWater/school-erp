import { prisma } from '@/lib/prisma';
import { DashboardClient } from './DashboardClient';

export default async function Dashboard() {
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

  return <DashboardClient auditLogs={auditLogs} />;
}
