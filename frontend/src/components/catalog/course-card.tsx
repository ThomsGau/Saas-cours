import Image from "next/image";
import Link from "next/link";
import {
  BookOpenIcon,
  ClockIcon,
  FileTextIcon,
  VideoIcon,
} from "lucide-react";

import { LEVEL_STYLES } from "@/components/landing/landing-data";
import type { CatalogCourse } from "@/lib/catalog/catalog-data";
import { cn } from "@/lib/utils";

type CourseCardProps = {
  course: CatalogCourse;
  isSubscribed: boolean;
  onSubscribeRequest: () => void;
};

function CourseCardContent({
  course,
  isSubscribed,
}: {
  course: CatalogCourse;
  isSubscribed: boolean;
}) {
  const TypeIcon = course.type === "PDF" ? FileTextIcon : VideoIcon;
  const DurationIcon = course.type === "PDF" ? BookOpenIcon : ClockIcon;
  const typeLabel = course.type === "PDF" ? "PDF" : "Vidéo";

  return (
    <>
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={course.image}
          alt={course.title}
          fill
          className={cn(
            "object-cover transition-transform duration-300 group-hover:scale-105",
            !isSubscribed && "blur-md",
          )}
          sizes="(max-width: 640px) 100vw, 33vw"
        />
        {course.type ? (
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <span className="inline-flex items-center gap-1 rounded-md bg-card px-2 py-1 text-xs font-medium text-foreground shadow-sm ring-1 ring-black/5 backdrop-blur-md">
              <TypeIcon className="size-3" />
              {typeLabel}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <span
          className={cn(
            "w-fit rounded-full px-2.5 py-0.5 text-xs font-medium",
            LEVEL_STYLES[course.level],
          )}
        >
          {course.level}
        </span>

        <h3 className="line-clamp-2 font-serif text-lg font-semibold leading-snug text-brand-brown-dark">
          {course.title}
        </h3>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {course.description?.trim() || course.authorName}
        </p>

        <div className="mt-auto flex items-center border-t border-border/50 pt-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <DurationIcon className="size-3.5" />
            {course.duration}
          </span>
        </div>
      </div>
    </>
  );
}

export function CourseCard({
  course,
  isSubscribed,
  onSubscribeRequest,
}: CourseCardProps) {
  const className =
    "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card text-left shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft-lg";

  if (isSubscribed) {
    return (
      <Link href={`/courses/${course.id}`} className={className}>
        <CourseCardContent course={course} isSubscribed={isSubscribed} />
      </Link>
    );
  }

  return (
    <button type="button" onClick={onSubscribeRequest} className={className}>
      <CourseCardContent course={course} isSubscribed={isSubscribed} />
    </button>
  );
}
