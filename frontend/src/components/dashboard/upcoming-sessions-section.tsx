import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

import { getInstructorLabel } from "@/components/landing/landing-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatSessionTimeRange } from "@/lib/format/datetime";
import type { InstructorSummary, PrivateSession } from "@/lib/api/types";

type UpcomingSessionsSectionProps = {
  sessions: PrivateSession[];
  instructorsById: Map<number, InstructorSummary>;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

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

export function UpcomingSessionsSection({
  sessions,
  instructorsById,
}: UpcomingSessionsSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-xl font-semibold text-brand-brown-dark">
          Vos prochaines sessions
        </h2>
        <Link
          href="/booking"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Voir l&apos;agenda
          <ChevronRightIcon className="size-4" />
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card p-6 text-center text-sm text-muted-foreground shadow-soft">
          Aucune session confirmée à venir.{" "}
          <Link href="/booking" className="font-medium text-brand-brown hover:underline">
            Réserver une session
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {sessions.map((session) => {
            const displayName = getInstructorDisplayName(
              session,
              instructorsById,
            );
            const instructor = instructorsById.get(session.instructorId);

            return (
              <li key={session.id}>
                <article className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card p-4 shadow-soft sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar size="lg" className="size-12 shrink-0">
                      {instructor?.avatarUrl ? (
                        <AvatarImage src={instructor.avatarUrl} alt={displayName} />
                      ) : null}
                      <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-serif font-semibold text-brand-brown-dark">
                        Session privée
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        avec {displayName}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm text-muted-foreground sm:text-center">
                    {formatSessionTimeRange(
                      session.scheduledAt,
                      session.durationMinutes,
                    )}
                  </p>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
