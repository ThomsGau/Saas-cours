"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2Icon, SparklesIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { listCourses } from "@/lib/api/catalog.service";
import { isSubscriptionActive } from "@/lib/subscription/check-subscription";
import { ApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type SubscriptionCardProps = {
  compact?: boolean;
  className?: string;
};

export function SubscriptionCard({
  compact = false,
  className,
}: SubscriptionCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [courseCount, setCourseCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSubscription() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const active = await isSubscriptionActive();
        if (cancelled) {
          return;
        }

        setIsActive(active);

        if (active) {
          const courses = await listCourses();
          if (!cancelled) {
            setCourseCount(courses.length);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof ApiError
              ? error.message
              : "Impossible de vérifier l'abonnement.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadSubscription();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border/50 bg-card p-5 shadow-soft",
          className,
        )}
      >
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-4 h-8 w-24" />
        <Skeleton className="mt-2 h-4 w-48" />
      </div>
    );
  }

  if (compact) {
    return (
      <section
        className={cn(
          "rounded-2xl border border-border/50 bg-secondary/60 p-5 shadow-soft",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-serif text-lg font-semibold text-brand-brown-dark">
            Abonnement
          </h2>
          {isActive ? (
            <Badge className="shrink-0 gap-1 bg-card text-foreground">
              <CheckCircle2Icon className="size-3" />
              Actif
            </Badge>
          ) : (
            <Badge variant="secondary" className="shrink-0 bg-card">
              Inactif
            </Badge>
          )}
        </div>

        <div className="mt-3 space-y-2 text-sm">
          {errorMessage ? (
            <p className="text-destructive">{errorMessage}</p>
          ) : isActive ? (
            <>
              <div className="flex items-center gap-2 text-foreground">
                <SparklesIcon className="size-4 text-muted-foreground" />
                <span className="font-medium">
                  {courseCount} cours disponible{courseCount > 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-muted-foreground">
                Accès complet au catalogue vidéo et PDF.
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">
              Abonnez-vous pour accéder aux cours vidéo et PDF.
            </p>
          )}
        </div>

        <div className="mt-4">
          {isActive ? (
            <Button
              size="sm"
              variant="outline"
              className="w-full rounded-full bg-card"
              render={<Link href="/courses" />}
            >
              Voir le catalogue
            </Button>
          ) : (
            <Button
              size="sm"
              className="w-full rounded-full"
              render={<Link href="/subscribe" />}
            >
              S&apos;abonner
            </Button>
          )}
        </div>
      </section>
    );
  }

  return (
    <Card className={cn("shadow-soft", className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>Abonnement catalogue</CardTitle>
            <CardDescription>
              {isActive
                ? "Votre abonnement est actif."
                : "Aucun abonnement actif détecté."}
            </CardDescription>
          </div>
          {isActive ? (
            <Badge className="shrink-0 gap-1 bg-accent text-accent-foreground">
              <CheckCircle2Icon className="size-3" />
              Actif
            </Badge>
          ) : (
            <Badge variant="secondary" className="shrink-0">
              Inactif
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {errorMessage ? (
          <Alert variant="destructive">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : isActive ? (
          <>
            <div className="flex items-center gap-2 text-foreground">
              <SparklesIcon className="size-4 text-muted-foreground" />
              <span className="font-medium">
                {courseCount} cours disponible{courseCount > 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-muted-foreground">
              Accès complet au catalogue vidéo et PDF.
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">
            Abonnez-vous pour accéder aux cours vidéo et PDF.
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {isActive ? (
          <Button size="sm" render={<Link href="/courses" />}>
            Voir le catalogue
          </Button>
        ) : (
          <Button size="sm" render={<Link href="/subscribe" />}>
            S&apos;abonner
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
