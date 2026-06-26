"use client";

import { useState } from "react";
import { toast } from "sonner";

import { SessionStatusBadge } from "@/components/sessions/session-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createPrivateSessionCheckout } from "@/lib/api/payments.service";
import { ApiError } from "@/lib/api/errors";
import { formatDateTime } from "@/lib/format/datetime";
import type { PrivateSession } from "@/lib/api/types";

type PrivateSessionsListProps = {
  sessions: PrivateSession[];
  variant: "student" | "instructor";
};

export function PrivateSessionsList({
  sessions,
  variant,
}: PrivateSessionsListProps) {
  const [payingSessionId, setPayingSessionId] = useState<number | null>(null);

  if (sessions.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        {variant === "student"
          ? "Aucune réservation pour le moment."
          : "Aucune session reçue pour le moment."}
      </p>
    );
  }

  async function handlePay(sessionId: number) {
    setPayingSessionId(sessionId);

    try {
      const response = await createPrivateSessionCheckout(sessionId);
      window.location.href = response.checkoutUrl;
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Impossible de démarrer le paiement.";

      toast.error("Paiement impossible", { description: message });
      setPayingSessionId(null);
    }
  }

  return (
    <ul className="space-y-3">
      {sessions.map((session) => {
        const counterpartEmail =
          variant === "student"
            ? session.instructorEmail
            : session.studentEmail;
        const counterpartLabel =
          variant === "student" ? "Instructeur" : "Élève";

        return (
          <li key={session.id}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <CardTitle className="text-base">
                    Session du {formatDateTime(session.scheduledAt)}
                  </CardTitle>
                  <SessionStatusBadge status={session.status} />
                </div>
                <CardDescription>
                  {counterpartLabel} : {counterpartEmail} · {session.durationMinutes}{" "}
                  min
                </CardDescription>
              </CardHeader>
              {variant === "student" && session.status === "REQUESTED" ? (
                <CardContent className="pt-0">
                  <Button
                    size="sm"
                    disabled={payingSessionId === session.id}
                    onClick={() => void handlePay(session.id)}
                  >
                    {payingSessionId === session.id
                      ? "Redirection Stripe..."
                      : "Payer la session"}
                  </Button>
                </CardContent>
              ) : null}
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
