import Link from "next/link";
import { CheckCircle2Icon } from "lucide-react";

import { getInstructorLabel } from "@/components/landing/landing-data";
import { formatDateTime } from "@/lib/format/datetime";
import type { InstructorSummary, PrivateSession } from "@/lib/api/types";

type RecentActivityPanelProps = {
  sessions: PrivateSession[];
  instructorsById: Map<number, InstructorSummary>;
};

function getInstructorDisplayName(
  session: PrivateSession,
  instructorsById: Map<number, InstructorSummary>,
): string {
  const instructor = instructorsById.get(session.instructorId);
  return (
    instructor?.displayName?.trim() ||
    getInstructorLabel(session.instructorEmail, "Coach")
  );
}

export function RecentActivityPanel({
  sessions,
  instructorsById,
}: RecentActivityPanelProps) {
  return (
    <section className="rounded-2xl border border-border/50 bg-card p-5 shadow-soft">
      <h2 className="font-serif text-xl font-semibold text-brand-brown-dark">
        Activité récente
      </h2>

      {sessions.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Aucune session terminée pour le moment.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {sessions.map((session) => {
            const coachName = getInstructorDisplayName(
              session,
              instructorsById,
            );

            return (
              <li
                key={session.id}
                className="flex items-start gap-3 border-b border-border/40 pb-4 last:border-0 last:pb-0"
              >
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <CheckCircle2Icon className="size-4 text-brand-brown" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Session terminée
                  </p>
                  <p className="text-sm text-muted-foreground">
                    avec {coachName} · {session.durationMinutes} min
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDateTime(session.scheduledAt)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {sessions.length > 0 ? (
        <Link
          href="#mes-reservations"
          className="mt-5 flex w-full items-center justify-center rounded-full bg-secondary px-4 py-2 text-sm font-medium text-brand-brown transition-colors hover:bg-secondary/80"
        >
          Voir tout l&apos;historique
        </Link>
      ) : null}
    </section>
  );
}
