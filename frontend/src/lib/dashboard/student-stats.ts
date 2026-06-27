import type { PrivateSession } from "@/lib/api/types";

export type StudentDashboardStats = {
  confirmedCount: number;
  pendingCount: number;
  upcomingCount: number;
  completedHours: number;
};

export function computeStudentDashboardStats(
  sessions: PrivateSession[],
  now: Date = new Date(),
): StudentDashboardStats {
  let confirmedCount = 0;
  let pendingCount = 0;
  let upcomingCount = 0;
  let completedMinutes = 0;

  for (const session of sessions) {
    if (session.status === "CONFIRMED") {
      confirmedCount += 1;
      if (new Date(session.scheduledAt) > now) {
        upcomingCount += 1;
      }
    } else if (session.status === "REQUESTED") {
      pendingCount += 1;
    } else if (session.status === "COMPLETED") {
      completedMinutes += session.durationMinutes;
    }
  }

  return {
    confirmedCount,
    pendingCount,
    upcomingCount,
    completedHours: Math.floor(completedMinutes / 60),
  };
}

export function getUpcomingSessions(
  sessions: PrivateSession[],
  now: Date = new Date(),
): PrivateSession[] {
  return sessions
    .filter(
      (session) =>
        session.status === "CONFIRMED" &&
        new Date(session.scheduledAt) > now,
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
}

export function getRecentCompletedSessions(
  sessions: PrivateSession[],
  limit = 5,
): PrivateSession[] {
  return sessions
    .filter((session) => session.status === "COMPLETED")
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    )
    .slice(0, limit);
}

export function formatCompletedHours(hours: number): string {
  return `${hours}h`;
}
