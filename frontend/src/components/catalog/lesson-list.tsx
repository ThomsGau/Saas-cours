"use client";

import { FileTextIcon, PlayCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/lib/api/types";

type LessonListProps = {
  lessons: Lesson[];
  selectedLessonId: number | null;
  onSelectLesson: (lesson: Lesson) => void;
};

export function LessonList({
  lessons,
  selectedLessonId,
  onSelectLesson,
}: LessonListProps) {
  const sortedLessons = [...lessons].sort((a, b) => a.position - b.position);

  return (
    <ul className="space-y-2">
      {sortedLessons.map((lesson) => {
        const isSelected = lesson.id === selectedLessonId;
        const isVideo = lesson.lessonType === "VIDEO";

        return (
          <li key={lesson.id}>
            <Button
              type="button"
              variant={isSelected ? "secondary" : "ghost"}
              className={cn(
                "h-auto w-full justify-start gap-3 px-3 py-3 text-left",
                isSelected && "ring-1 ring-primary/30",
              )}
              onClick={() => onSelectLesson(lesson)}
            >
              {isVideo ? (
                <PlayCircleIcon className="size-4 shrink-0" />
              ) : (
                <FileTextIcon className="size-4 shrink-0" />
              )}
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate font-medium">{lesson.title}</span>
                <span className="text-xs text-muted-foreground">
                  {isVideo ? "Vidéo" : "PDF"}
                  {lesson.durationMinutes
                    ? ` · ${lesson.durationMinutes} min`
                    : ""}
                </span>
              </span>
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
