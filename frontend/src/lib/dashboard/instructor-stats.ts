import type { PrivateSession } from "@/lib/api/types";

export type InstructorDashboardStats = {
  upcomingCount: number;
  confirmedCount: number;
};

export function computeInstructorDashboardStats(
  sessions: PrivateSession[],
): InstructorDashboardStats {
  let upcomingCount = 0;
  let confirmedCount = 0;

  for (const session of sessions) {
    if (session.status === "CONFIRMED") {
      confirmedCount += 1;
      upcomingCount += 1;
    } else if (session.status === "REQUESTED") {
      upcomingCount += 1;
    }
  }

  return {
    upcomingCount,
    confirmedCount,
  };
}
