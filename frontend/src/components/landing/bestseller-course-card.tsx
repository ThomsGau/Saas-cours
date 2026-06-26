import Image from "next/image";
import Link from "next/link";
import { ClockIcon, FileTextIcon, StarIcon, VideoIcon } from "lucide-react";

import {
  getInstructorLabel,
  LEVEL_STYLES,
  type CoursePlaceholder,
} from "@/components/landing/landing-data";
import type { CourseSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type BestsellerCourseCardProps = {
  course: CourseSummary;
  placeholder: CoursePlaceholder;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm font-medium text-foreground">{rating}</span>
      <div className="flex">
        {Array.from({ length: 5 }).map((_, index) => (
          <StarIcon
            key={index}
            className={cn(
              "size-3.5",
              index < Math.floor(rating)
                ? "fill-brand-orange text-brand-orange"
                : "fill-muted text-muted",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function BestsellerCourseCard({
  course,
  placeholder,
}: BestsellerCourseCardProps) {
  const author =
    placeholder.authorName || getInstructorLabel(course.instructorEmail);
  const TypeIcon = placeholder.type === "PDF" ? FileTextIcon : VideoIcon;

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group flex w-[min(100%,320px)] shrink-0 flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft-lg sm:w-auto"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={placeholder.image}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 320px, 33vw"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="inline-flex items-center gap-1 rounded-md bg-card/90 px-2 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
            <TypeIcon className="size-3" />
            {placeholder.type}
          </span>
          <span className="rounded-md bg-brand-orange px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            Populaire
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium",
              LEVEL_STYLES[placeholder.level],
            )}
          >
            {placeholder.level}
          </span>
          <span className="text-xs text-muted-foreground">
            {placeholder.category}
          </span>
        </div>

        <h3 className="font-serif text-lg font-semibold leading-snug text-brand-brown-dark line-clamp-2">
          {course.title}
        </h3>

        <p className="text-sm text-muted-foreground">{author}</p>

        <div className="flex items-center gap-2">
          <StarRating rating={placeholder.rating} />
          <span className="text-xs text-muted-foreground">
            ({placeholder.reviews})
          </span>
        </div>

        <div className="mt-auto flex items-center border-t border-border/50 pt-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ClockIcon className="size-3.5" />
            {placeholder.duration}
          </span>
        </div>
      </div>
    </Link>
  );
}
