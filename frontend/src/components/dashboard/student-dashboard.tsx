"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { PrivateSessionsList } from "@/components/sessions/private-sessions-list";
import { SubscriptionCard } from "@/components/dashboard/subscription-card";
import { StatCard } from "@/components/layout/stat-card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { listMyBookings } from "@/lib/api/booking.service";
import type { PrivateSession } from "@/lib/api/types";

export function StudentDashboard() {
  const [sessions, setSessions] = useState<PrivateSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSessions() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await listMyBookings();
        if (!cancelled) {
          setSessions(data);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Impossible de charger vos réservations.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadSessions();

    return () => {
      cancelled = true;
    };
  }, []);

  const confirmedCount = sessions.filter((s) => s.status === "CONFIRMED").length;
  const pendingCount = sessions.filter((s) => s.status === "REQUESTED").length;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SubscriptionCard />
        <StatCard
          label="Sessions confirmées"
          value={confirmedCount}
          hint="Réservations validées et payées"
        />
        <StatCard
          label="En attente de paiement"
          value={pendingCount}
          hint="Sessions à finaliser sur Stripe"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-medium text-foreground">Mes réservations</h2>
          <p className="text-sm text-muted-foreground">
            Historique et sessions en attente de paiement.
          </p>
        </div>
        <Button size="sm" render={<Link href="/booking" />}>
          Réserver une session
        </Button>
      </div>

      <Card className="shadow-soft">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          ) : errorMessage ? (
            <Alert variant="destructive">
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : (
            <PrivateSessionsList sessions={sessions} variant="student" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
