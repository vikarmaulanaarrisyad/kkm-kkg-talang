import prisma from "./prisma";

export type ActivityLog = {
  id: string;
  action: string;
  description: string;
  user: string;
  created_at: string;
};

export async function addActivityLog(action: string, description: string, user: string = "Admin") {
  try {
    await prisma.activityLog.create({
      data: {
        action,
        description,
        user,
      }
    });
  } catch (e) {
    console.error("Failed to add activity log:", e);
  }
}

export async function getActivityLogs(limit = 10): Promise<ActivityLog[]> {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { created_at: "desc" },
      take: limit
    });
    
    return logs.map(log => ({
      ...log,
      created_at: log.created_at.toISOString()
    }));
  } catch (e) {
    console.error("Failed to get activity logs:", e);
    return [];
  }
}
