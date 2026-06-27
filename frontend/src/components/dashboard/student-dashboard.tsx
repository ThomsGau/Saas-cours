"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClockIcon,
  CheckCircle2Icon,
  ClockIcon,
  HourglassIcon,
} from "lucide-react";

import { FeaturedCourseBanner } from "@/components/dashboard/featured-course-banner";
import { RecentActivityPanel } from "@/components/dashboard/recent-activity-panel";
import { SubscriptionCard } from "@/components/dashboard/subscription-card";
import { UpcomingSessionsSection } from "@/components/dashboard/upcoming-sessions-section";
import { PrivateSessionsList } from "@/components/sessions/private-sessions-list";
import { StatCard } from "@/components/layout/stat-card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { listCourses } from "@/lib/api/catalog.service";
import { listMyBookings } from "@/lib/api/booking.service";
import { listInstructors } from "@/lib/api/instructor.service";
import type { CourseSummary, InstructorSummary, PrivateSession } from "@/lib/api/types";
import {
  computeStudentDashboardStats,
  formatCompletedHours,
  getRecentCompletedSessions,
  getUpcomingSessions,
} from "@/lib/dashboard/student-stats";
import { isSubscriptionActive } from "@/lib/subscription/check-subscription";

export function StudentDashboard() {
  const [sessions, setSessions] = useState<PrivateSession[]>([]);
  const [instructors, setInstructors] = useState<InstructorSummary[]>([]);
  const [featuredCourse, setFeaturedCourse] = useState<CourseSummary | null>(
    null,
  );
  const [isSubscriptionActiveState, setIsSubscriptionActiveState] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [bookings, instructorList] = await Promise.all([
        listMyBookings(),
        listInstructors(),
      ]);
      setSessions(bookings);
      setInstructors(instructorList);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible de charger vos réservations.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalogData() {
      setIsCatalogLoading(true);

      try {
        const active = await isSubscriptionActive();
        if (cancelled) {
          return;
        }

        setIsSubscriptionActiveState(active);

        if (active) {
          const courses = await listCourses();
          if (!cancelled) {
            setFeaturedCourse(courses[0] ?? null);
          }
        } else {
          setFeaturedCourse(null);
        }
      } catch {
        if (!cancelled) {
          setIsSubscriptionActiveState(false);
          setFeaturedCourse(null);
        }
      } finally {
        if (!cancelled) {
          setIsCatalogLoading(false);
        }
      }
    }

    void loadCatalogData();

    return () => {
      cancelled = true;
    };
  }, []);

  const instructorsById = useMemo(
    () => new Map(instructors.map((instructor) => [instructor.id, instructor])),
    [instructors],
  );

  const stats = useMemo(
    () => computeStudentDashboardStats(sessions),
    [sessions],
  );
  const upcomingSessions = useMemo(
    () => getUpcomingSessions(sessions),
    [sessions],
  );
  const recentCompletedSessions = useMemo(
    () => getRecentCompletedSessions(sessions),
    [sessions],
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-56 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Sessions confirmées"
          value={stats.confirmedCount}
          hint="Réservations validées et payées"
          icon={CheckCircle2Icon}
        />
        <StatCard
          label="En attente de paiement"
          value={stats.pendingCount}
          hint="Sessions à finaliser sur Stripe"
          icon={HourglassIcon}
        />
        <StatCard
          label="Sessions à venir"
          value={stats.upcomingCount}
          hint="Prochaines sessions confirmées"
          icon={CalendarClockIcon}
        />
        <StatCard
          label="Heures complétées"
          value={formatCompletedHours(stats.completedHours)}
          hint="Temps passé en session privée"
          icon={ClockIcon}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <UpcomingSessionsSection
            sessions={upcomingSessions}
            instructorsById={instructorsById}
          />

          <FeaturedCourseBanner
            isLoading={isCatalogLoading}
            isSubscriptionActive={isSubscriptionActiveState}
            course={featuredCourse}
          />

          <section id="mes-reservations" className="space-y-4 scroll-mt-24">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-serif text-xl font-semibold text-brand-brown-dark">
                  Mes réservations
                </h2>
                <p className="text-sm text-muted-foreground">
                  Historique et sessions en attente de paiement.
                </p>
              </div>
              <Button
                size="sm"
                className="rounded-full"
                render={<Link href="/booking" />}
              >
                Réserver une session
              </Button>
            </div>

            <Card className="rounded-2xl border-border/50 shadow-soft">
              <CardContent className="pt-6">
                {errorMessage ? (
                  <Alert variant="destructive">
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                ) : (
                  <PrivateSessionsList
                    sessions={sessions}
                    variant="student"
                    onSessionUpdated={() => void loadDashboardData()}
                  />
                )}
              </CardContent>
            </Card>
          </section>
        </div>

        <aside className="space-y-6">
          <RecentActivityPanel
            sessions={recentCompletedSessions}
            instructorsById={instructorsById}
          />
          <SubscriptionCard compact />
        </aside>
      </div>
    </div>
  );
}
