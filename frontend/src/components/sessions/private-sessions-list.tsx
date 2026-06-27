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
import { cancelSession } from "@/lib/api/booking.service";
import { createPrivateSessionCheckout } from "@/lib/api/payments.service";
import { ApiError } from "@/lib/api/errors";
import { formatDateTime } from "@/lib/format/datetime";
import type { PrivateSession } from "@/lib/api/types";

type PrivateSessionsListProps = {
  sessions: PrivateSession[];
  variant: "student" | "instructor";
  onSessionUpdated?: () => void;
};

export function PrivateSessionsList({
  sessions,
  variant,
  onSessionUpdated,
}: PrivateSessionsListProps) {
  const [payingSessionId, setPayingSessionId] = useState<number | null>(null);
  const [cancellingSessionId, setCancellingSessionId] = useState<number | null>(
    null,
  );

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

  async function handleCancel(sessionId: number) {
    setCancellingSessionId(sessionId);

    try {
      await cancelSession(sessionId);
      toast.success("Session annulée");
      onSessionUpdated?.();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Impossible d'annuler cette session.";

      toast.error("Annulation échouée", { description: message });
    } finally {
      setCancellingSessionId(null);
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
              {session.status === "REQUESTED" ? (
                <CardContent className="flex flex-wrap gap-2 pt-0">
                  {variant === "student" ? (
                    <Button
                      size="sm"
                      disabled={payingSessionId === session.id}
                      onClick={() => void handlePay(session.id)}
                    >
                      {payingSessionId === session.id
                        ? "Redirection Stripe..."
                        : "Payer la session"}
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={cancellingSessionId === session.id}
                    onClick={() => void handleCancel(session.id)}
                  >
                    {cancellingSessionId === session.id
                      ? "Annulation..."
                      : "Annuler"}
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
