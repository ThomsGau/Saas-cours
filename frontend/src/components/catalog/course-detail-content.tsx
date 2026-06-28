"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeftIcon } from "lucide-react";

import { LessonList } from "@/components/catalog/lesson-list";
import { PdfViewer } from "@/components/catalog/pdf-viewer";
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
import { getCourse, getLesson } from "@/lib/api/catalog.service";
import { handleCatalogError } from "@/lib/catalog/handle-catalog-error";
import type { CourseDetail, Lesson, LessonPreview } from "@/lib/api/types";

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

function LessonContentSkeleton() {
  return <Skeleton className="aspect-video w-full rounded-lg" />;
}

export function CourseDetailContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const courseId = params.id;
  const callbackUrl = `/courses/${courseId}`;
  const { status } = useSession();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonPreview | null>(
    null,
  );
  const [lessonContent, setLessonContent] = useState<Lesson | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadLessonContent = useCallback(
    async (lesson: LessonPreview) => {
      setIsLoadingLesson(true);
      setLessonContent(null);

      try {
        const data = await getLesson(courseId, lesson.id);
        setLessonContent(data);
      } catch (error) {
        if (handleCatalogError(error, router, callbackUrl)) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Impossible de charger cette leçon.",
        );
      } finally {
        setIsLoadingLesson(false);
      }
    },
    [callbackUrl, courseId, router],
  );

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
      setIsLoadingCourse(true);
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
        const firstLesson = sortedLessons[0] ?? null;
        setSelectedLesson(firstLesson);

        if (firstLesson) {
          await loadLessonContent(firstLesson);
        }
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
          setIsLoadingCourse(false);
        }
      }
    }

    void loadCourse();

    return () => {
      cancelled = true;
    };
  }, [callbackUrl, courseId, loadLessonContent, router, status]);

  const handleSelectLesson = (lesson: LessonPreview) => {
    setSelectedLesson(lesson);
    void loadLessonContent(lesson);
  };

  if (status === "loading" || isLoadingCourse) {
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
            ) : isLoadingLesson ? (
              <LessonContentSkeleton />
            ) : !lessonContent ? (
              <p className="text-sm text-muted-foreground">
                Impossible de charger le contenu de cette leçon.
              </p>
            ) : lessonContent.lessonType === "VIDEO" ? (
              <VideoPlayer
                src={lessonContent.contentUrl}
                title={lessonContent.title}
              />
            ) : (
              <PdfViewer
                src={lessonContent.contentUrl}
                title={lessonContent.title}
              />
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
              onSelectLesson={handleSelectLesson}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
