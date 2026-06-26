"use client";

import { useEffect, useState } from "react";

import { CreateAvailabilityForm } from "@/components/dashboard/create-availability-form";
import { MyAvailabilitiesList } from "@/components/dashboard/my-availabilities-list";
import { PrivateSessionsList } from "@/components/sessions/private-sessions-list";
import { StatCard } from "@/components/layout/stat-card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { listInstructorSessions } from "@/lib/api/booking.service";
import type { PrivateSession } from "@/lib/api/types";

export function InstructorDashboard() {
  const [sessions, setSessions] = useState<PrivateSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [availabilityRefreshKey, setAvailabilityRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadSessions() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await listInstructorSessions();
        if (!cancelled) {
          setSessions(data);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Impossible de charger vos sessions.",
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

  const upcomingCount = sessions.filter(
    (s) => s.status === "CONFIRMED" || s.status === "REQUESTED",
  ).length;
  const confirmedCount = sessions.filter((s) => s.status === "CONFIRMED").length;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Sessions à venir"
          value={upcomingCount}
          hint="Confirmées ou en attente de paiement"
        />
        <StatCard
          label="Sessions confirmées"
          value={confirmedCount}
          hint="Réservations finalisées par les élèves"
        />
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium text-foreground">
            Disponibilités
          </h2>
          <p className="text-sm text-muted-foreground">
            Créez et gérez vos créneaux de coaching.
          </p>
        </div>
        <CreateAvailabilityForm
          onCreated={() => setAvailabilityRefreshKey((key) => key + 1)}
        />
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Mes créneaux</CardTitle>
            <CardDescription>
              Créneaux futurs (les créneaux réservés ne peuvent pas être supprimés).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MyAvailabilitiesList refreshKey={availabilityRefreshKey} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium text-foreground">
            Sessions reçues
          </h2>
          <p className="text-sm text-muted-foreground">
            Réservations effectuées par les élèves.
          </p>
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
              <PrivateSessionsList sessions={sessions} variant="instructor" />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
