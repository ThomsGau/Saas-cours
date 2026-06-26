"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeftIcon } from "lucide-react";

import { LessonList } from "@/components/catalog/lesson-list";
import { VideoPlayer } from "@/components/catalog/video-player";
import { PageHeader } from "@/components/layout/page-header";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCourse } from "@/lib/api/catalog.service";
import { handleCatalogError } from "@/lib/catalog/handle-catalog-error";
import type { CourseDetail, Lesson } from "@/lib/api/types";

function CourseDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="aspect-video w-full rounded-lg" />
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
  );
}

export function CourseDetailContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const courseId = params.id;
  const callbackUrl = `/courses/${courseId}`;
  const { status } = useSession();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    let cancelled = false;

    async function loadCourse() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await getCourse(courseId);
        if (cancelled) {
          return;
        }

        const sortedLessons = [...data.lessons].sort(
          (a, b) => a.position - b.position,
        );

        setCourse(data);
        setSelectedLesson(sortedLessons[0] ?? null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (handleCatalogError(error, router, callbackUrl)) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Impossible de charger ce cours.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadCourse();

    return () => {
      cancelled = true;
    };
  }, [callbackUrl, courseId, router, status]);

  if (status === "loading" || isLoading) {
    return <CourseDetailSkeleton />;
  }

  if (errorMessage) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
        <Button variant="outline" render={<Link href="/courses" />}>
          <ArrowLeftIcon />
          Retour au catalogue
        </Button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTitle>Cours introuvable</AlertTitle>
          <AlertDescription>
            Ce cours n&apos;existe pas ou n&apos;est plus disponible.
          </AlertDescription>
        </Alert>
        <Button variant="outline" render={<Link href="/courses" />}>
          <ArrowLeftIcon />
          Retour au catalogue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={course.title}
        description={
          course.description ?? "Aucune description disponible."
        }
        breadcrumbs={[
          { label: "Catalogue", href: "/courses" },
          { label: course.title },
        ]}
        actions={
          <Button variant="outline" size="sm" render={<Link href="/courses" />}>
            <ArrowLeftIcon />
            Retour
          </Button>
        }
      />

      <p className="-mt-4 text-xs text-muted-foreground">
        Instructeur : {course.instructorEmail}
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="min-w-0 shadow-soft">
          <CardHeader>
            <CardTitle>
              {selectedLesson?.title ?? "Sélectionnez une leçon"}
            </CardTitle>
            {selectedLesson?.description ? (
              <CardDescription>{selectedLesson.description}</CardDescription>
            ) : null}
          </CardHeader>
          <CardContent>
            {!selectedLesson ? (
              <p className="text-sm text-muted-foreground">
                Ce cours ne contient pas encore de leçons.
              </p>
            ) : selectedLesson.lessonType === "VIDEO" ? (
              <VideoPlayer
                src={selectedLesson.contentUrl}
                title={selectedLesson.title}
              />
            ) : (
              <div className="space-y-4">
                <iframe
                  src={selectedLesson.contentUrl}
                  title={selectedLesson.title}
                  className="aspect-[4/3] w-full rounded-lg border border-border/60 bg-muted shadow-soft"
                />
                <Button
                  variant="outline"
                  render={
                    <a
                      href={selectedLesson.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  Ouvrir le PDF dans un nouvel onglet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 shadow-soft lg:sticky lg:top-24 lg:self-start">
          <CardHeader>
            <CardTitle>Leçons</CardTitle>
            <CardDescription>
              {course.lessons.length} leçon
              {course.lessons.length > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LessonList
              lessons={course.lessons}
              selectedLessonId={selectedLesson?.id ?? null}
              onSelectLesson={setSelectedLesson}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
