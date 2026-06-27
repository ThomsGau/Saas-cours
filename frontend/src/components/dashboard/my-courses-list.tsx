"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileTextIcon,
  Trash2Icon,
  VideoIcon,
} from "lucide-react";
import { toast } from "sonner";

import { AddLessonForm } from "@/components/dashboard/add-lesson-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  deleteCourse,
  deleteLesson,
  getMyCourse,
  listMyCourses,
} from "@/lib/api/catalog-instructor.service";
import { ApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import type { CourseDetail, CourseSummary } from "@/lib/api/types";

type MyCoursesListProps = {
  refreshKey?: number;
};

export function MyCoursesList({ refreshKey = 0 }: MyCoursesListProps) {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null);

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await listMyCourses();
      setCourses(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible de charger vos cours.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses, refreshKey]);

  async function handleDeleteCourse(courseId: number) {
    setDeletingCourseId(courseId);

    try {
      await deleteCourse(courseId);
      toast.success("Cours supprimé");
      if (expandedId === courseId) {
        setExpandedId(null);
      }
      await loadCourses();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Impossible de supprimer ce cours.";

      toast.error("Suppression échouée", { description: message });
    } finally {
      setDeletingCourseId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {errorMessage}
      </p>
    );
  }

  if (courses.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
        Aucun cours pour le moment. Créez votre premier cours ci-dessus.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {courses.map((course) => {
        const isExpanded = expandedId === course.id;

        return (
          <li
            key={course.id}
            className="rounded-xl border border-border/50 bg-card"
          >
            <div className="flex items-center justify-between gap-3 p-4">
              <button
                type="button"
                onClick={() =>
                  setExpandedId((current) =>
                    current === course.id ? null : course.id,
                  )
                }
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="min-w-0">
                  <span className="block truncate font-medium text-foreground">
                    {course.title}
                  </span>
                  {course.description ? (
                    <span className="block truncate text-sm text-muted-foreground">
                      {course.description}
                    </span>
                  ) : null}
                </span>
              </button>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 bg-card text-destructive"
                disabled={deletingCourseId === course.id}
                onClick={() => void handleDeleteCourse(course.id)}
              >
                {deletingCourseId === course.id ? "Suppression..." : "Supprimer"}
              </Button>
            </div>

            {isExpanded ? (
              <CourseLessonsPanel courseId={course.id} />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function CourseLessonsPanel({ courseId }: { courseId: number }) {
  const [detail, setDetail] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingLessonId, setDeletingLessonId] = useState<number | null>(null);

  const loadDetail = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getMyCourse(courseId);
      setDetail(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible de charger les leçons.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  async function handleDeleteLesson(lessonId: number) {
    setDeletingLessonId(lessonId);

    try {
      await deleteLesson(courseId, lessonId);
      toast.success("Leçon supprimée");
      await loadDetail();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Impossible de supprimer cette leçon.";

      toast.error("Suppression échouée", { description: message });
    } finally {
      setDeletingLessonId(null);
    }
  }

  const lessons = detail
    ? [...detail.lessons].sort((a, b) => a.position - b.position)
    : [];

  return (
    <div className="space-y-4 border-t border-border/50 p-4">
      {isLoading ? (
        <Skeleton className="h-12 w-full rounded-lg" />
      ) : errorMessage ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : lessons.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune leçon. Ajoutez-en une ci-dessous.
        </p>
      ) : (
        <ul className="divide-y divide-border/40">
          {lessons.map((lesson) => (
            <li
              key={lesson.id}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2">
                {lesson.lessonType === "PDF" ? (
                  <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <VideoIcon className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {lesson.title}
                  </span>
                  <a
                    href={lesson.contentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "block truncate text-xs text-muted-foreground underline-offset-2 hover:underline",
                    )}
                  >
                    {lesson.contentUrl}
                  </a>
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-destructive"
                disabled={deletingLessonId === lesson.id}
                onClick={() => void handleDeleteLesson(lesson.id)}
                aria-label="Supprimer la leçon"
              >
                <Trash2Icon className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <AddLessonForm courseId={courseId} onAdded={() => void loadDetail()} />
    </div>
  );
}
