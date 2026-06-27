"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClockIcon, CheckCircle2Icon } from "lucide-react";

import { CreateAvailabilityForm } from "@/components/dashboard/create-availability-form";
import { CreateCourseForm } from "@/components/dashboard/create-course-form";
import { MyAvailabilitiesList } from "@/components/dashboard/my-availabilities-list";
import { MyCoursesList } from "@/components/dashboard/my-courses-list";
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
import { computeInstructorDashboardStats } from "@/lib/dashboard/instructor-stats";
import type { PrivateSession } from "@/lib/api/types";

export function InstructorDashboard() {
  const [sessions, setSessions] = useState<PrivateSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [availabilityRefreshKey, setAvailabilityRefreshKey] = useState(0);
  const [courseRefreshKey, setCourseRefreshKey] = useState(0);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await listInstructorSessions();
      setSessions(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible de charger vos sessions.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const stats = useMemo(
    () => computeInstructorDashboardStats(sessions),
    [sessions],
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Sessions à venir"
          value={stats.upcomingCount}
          hint="Confirmées ou en attente de paiement"
          icon={CalendarClockIcon}
        />
        <StatCard
          label="Sessions confirmées"
          value={stats.confirmedCount}
          hint="Réservations finalisées par les élèves"
          icon={CheckCircle2Icon}
        />
      </div>

      <section className="space-y-6">
        <div>
          <h2 className="font-serif text-xl font-semibold text-brand-brown-dark">
            Disponibilités
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Créez et gérez vos créneaux de coaching.
          </p>
        </div>

        <CreateAvailabilityForm
          onCreated={() => setAvailabilityRefreshKey((key) => key + 1)}
        />

        <Card className="rounded-2xl border-border/50 shadow-soft">
          <CardHeader>
            <CardTitle className="font-serif text-brand-brown-dark">
              Mes créneaux
            </CardTitle>
            <CardDescription>
              Créneaux futurs (les créneaux réservés ne peuvent pas être
              supprimés).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MyAvailabilitiesList refreshKey={availabilityRefreshKey} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="font-serif text-xl font-semibold text-brand-brown-dark">
            Catalogue — Mes cours
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Créez des cours et ajoutez-y des leçons PDF ou vidéo YouTube via un
            lien. Ils sont publiés immédiatement dans le catalogue.
          </p>
        </div>

        <CreateCourseForm
          onCreated={() => setCourseRefreshKey((key) => key + 1)}
        />

        <Card className="rounded-2xl border-border/50 shadow-soft">
          <CardHeader>
            <CardTitle className="font-serif text-brand-brown-dark">
              Mes cours
            </CardTitle>
            <CardDescription>
              Dépliez un cours pour gérer ses leçons.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MyCoursesList refreshKey={courseRefreshKey} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-xl font-semibold text-brand-brown-dark">
            Sessions reçues
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Réservations effectuées par les élèves.
          </p>
        </div>
        <Card className="rounded-2xl border-border/50 shadow-soft">
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            ) : errorMessage ? (
              <Alert variant="destructive">
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : (
              <PrivateSessionsList
                sessions={sessions}
                variant="instructor"
                onSessionUpdated={() => void loadSessions()}
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
