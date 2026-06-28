"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileTextIcon,
  Trash2Icon,
  VideoIcon,
} from "lucide-react";
import { toast } from "sonner";

import { AddLessonForm } from "@/components/dashboard/add-lesson-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBackdrop,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogPortal,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  deleteCourse,
  deleteLesson,
  getMyCourse,
  listMyCourses,
  updateCourse,
} from "@/lib/api/catalog-instructor.service";
import { ApiError } from "@/lib/api/errors";
import { COURSE_LEVELS } from "@/lib/catalog/catalog-data";
import { cn } from "@/lib/utils";
import type { CourseLevel, CourseSummary, InstructorCourseDetail } from "@/lib/api/types";

type MyCoursesListProps = {
  refreshKey?: number;
  expandCourseId?: number | null;
  scrollToAddLesson?: boolean;
  onExpandHandled?: () => void;
};

type PendingDelete =
  | { type: "course"; courseId: number; title: string }
  | { type: "lesson"; courseId: number; lessonId: number; title: string };

export function MyCoursesList({
  refreshKey = 0,
  expandCourseId = null,
  scrollToAddLesson = false,
  onExpandHandled,
}: MyCoursesListProps) {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [scrollTargetCourseId, setScrollTargetCourseId] = useState<number | null>(
    null,
  );
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);

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

  useEffect(() => {
    if (expandCourseId == null) {
      return;
    }

    setExpandedId(expandCourseId);
    if (scrollToAddLesson) {
      setScrollTargetCourseId(expandCourseId);
    }
    onExpandHandled?.();
  }, [expandCourseId, scrollToAddLesson, onExpandHandled]);

  async function confirmDelete() {
    if (!pendingDelete) {
      return;
    }

    if (pendingDelete.type === "course") {
      setDeletingCourseId(pendingDelete.courseId);

      try {
        await deleteCourse(pendingDelete.courseId);
        toast.success("Cours supprimé");
        if (expandedId === pendingDelete.courseId) {
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
    } else {
      try {
        await deleteLesson(pendingDelete.courseId, pendingDelete.lessonId);
        toast.success("Leçon supprimée");
        setExpandedId(pendingDelete.courseId);
        setDetailRefreshKey((key) => key + 1);
        await loadCourses();
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "Impossible de supprimer cette leçon.";

        toast.error("Suppression échouée", { description: message });
      }
    }

    setPendingDelete(null);
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
    <>
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
                    <span className="flex items-center gap-2">
                      <span className="block truncate font-medium text-foreground">
                        {course.title}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                          course.published
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {course.published ? "Publié" : "Brouillon"}
                      </span>
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
                  onClick={() =>
                    setPendingDelete({
                      type: "course",
                      courseId: course.id,
                      title: course.title,
                    })
                  }
                >
                  {deletingCourseId === course.id ? "Suppression..." : "Supprimer"}
                </Button>
              </div>

              {isExpanded ? (
                <CourseLessonsPanel
                  courseId={course.id}
                  detailRefreshKey={detailRefreshKey}
                  scrollToAddLesson={scrollTargetCourseId === course.id}
                  onScrollHandled={() => setScrollTargetCourseId(null)}
                  onChanged={() => void loadCourses()}
                  onRequestDeleteLesson={(lessonId, title) =>
                    setPendingDelete({
                      type: "lesson",
                      courseId: course.id,
                      lessonId,
                      title,
                    })
                  }
                />
              ) : null}
            </li>
          );
        })}
      </ul>

      <AlertDialog
        open={pendingDelete != null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
          }
        }}
      >
        <AlertDialogPortal>
          <AlertDialogBackdrop />
          <AlertDialogPopup>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {pendingDelete?.type === "course"
                  ? "Supprimer ce cours ?"
                  : "Supprimer cette leçon ?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {pendingDelete?.type === "course" ? (
                  <>
                    Le cours « {pendingDelete.title} » et toutes ses leçons seront
                    définitivement supprimés.
                  </>
                ) : pendingDelete ? (
                  <>
                    La leçon « {pendingDelete.title} » sera définitivement
                    supprimée.
                  </>
                ) : null}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => void confirmDelete()}
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogPopup>
        </AlertDialogPortal>
      </AlertDialog>
    </>
  );
}

type CourseLessonsPanelProps = {
  courseId: number;
  detailRefreshKey?: number;
  scrollToAddLesson?: boolean;
  onScrollHandled?: () => void;
  onChanged: () => void;
  onRequestDeleteLesson: (lessonId: number, title: string) => void;
};

function CourseLessonsPanel({
  courseId,
  detailRefreshKey = 0,
  scrollToAddLesson = false,
  onScrollHandled,
  onChanged,
  onRequestDeleteLesson,
}: CourseLessonsPanelProps) {
  const [detail, setDetail] = useState<InstructorCourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUpdatingLevel, setIsUpdatingLevel] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const addLessonFormRef = useRef<HTMLDivElement>(null);

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
  }, [loadDetail, detailRefreshKey]);

  useEffect(() => {
    if (!scrollToAddLesson || isLoading) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      addLessonFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      onScrollHandled?.();
    });

    return () => cancelAnimationFrame(frame);
  }, [scrollToAddLesson, isLoading, onScrollHandled]);

  async function handleLevelChange(level: CourseLevel) {
    if (!detail || detail.level === level) {
      return;
    }

    setIsUpdatingLevel(true);

    try {
      const updated = await updateCourse(courseId, { level });
      setDetail(updated);
      toast.success("Niveau mis à jour");
      onChanged();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Impossible de mettre à jour le niveau.";

      toast.error("Mise à jour échouée", { description: message });
    } finally {
      setIsUpdatingLevel(false);
    }
  }

  async function handlePublish() {
    if (!detail || detail.published) {
      return;
    }

    setIsPublishing(true);

    try {
      const updated = await updateCourse(courseId, { published: true });
      setDetail(updated);
      toast.success("Cours publié dans le catalogue");
      onChanged();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Impossible de publier ce cours.";

      toast.error("Publication échouée", { description: message });
    } finally {
      setIsPublishing(false);
    }
  }

  const lessons = detail
    ? [...detail.lessons].sort((a, b) => a.position - b.position)
    : [];
  const lockedLessonType =
    lessons.length > 0 ? lessons[0].lessonType : null;

  return (
    <div className="space-y-4 border-t border-border/50 p-4">
      {isLoading ? (
        <Skeleton className="h-12 w-full rounded-lg" />
      ) : errorMessage ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : detail ? (
        <div className="space-y-3 rounded-xl border border-border/50 bg-muted/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <Label htmlFor={`course-level-${courseId}`}>Niveau du cours</Label>
              <Select
                value={detail.level}
                onValueChange={(value) =>
                  void handleLevelChange(value as CourseLevel)
                }
                disabled={isUpdatingLevel}
              >
                <SelectTrigger
                  id={`course-level-${courseId}`}
                  className="w-full sm:max-w-xs"
                >
                  <SelectValue placeholder="Choisir un niveau" />
                </SelectTrigger>
                <SelectContent>
                  {COURSE_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!detail.published ? (
              <Button
                size="sm"
                disabled={isPublishing || lessons.length === 0}
                onClick={() => void handlePublish()}
              >
                {isPublishing ? "Publication..." : "Publier le cours"}
              </Button>
            ) : null}
          </div>
          {!detail.published && lessons.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ajoutez au moins une leçon pour publier ce cours dans le catalogue.
            </p>
          ) : null}
        </div>
      ) : null}

      {isLoading ? null : errorMessage ? null : lessons.length === 0 ? (
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
                onClick={() => onRequestDeleteLesson(lesson.id, lesson.title)}
                aria-label="Supprimer la leçon"
              >
                <Trash2Icon className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div ref={addLessonFormRef}>
        <AddLessonForm
          courseId={courseId}
          lockedLessonType={lockedLessonType}
          onAdded={() => {
            void loadDetail();
            onChanged();
          }}
        />
      </div>
    </div>
  );
}
