import Image from "next/image";
import Link from "next/link";
import {
  BookOpenIcon,
  ClockIcon,
  FileTextIcon,
  StarIcon,
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
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="inline-flex items-center gap-1 rounded-md bg-card/90 px-2 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
            <TypeIcon className="size-3" />
            {typeLabel}
          </span>
          {course.bestseller ? (
            <span className="rounded-md bg-brand-orange px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
              Bestseller
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium",
              LEVEL_STYLES[course.level],
            )}
          >
            {course.level}
          </span>
          <span className="text-xs text-muted-foreground">{course.category}</span>
        </div>

        <h3 className="line-clamp-2 font-serif text-lg font-semibold leading-snug text-brand-brown-dark">
          {course.title}
        </h3>

        <p className="text-sm text-muted-foreground">{course.authorName}</p>

        <div className="flex items-center gap-2">
          <StarRating rating={course.rating} />
          <span className="text-xs text-muted-foreground">
            ({course.reviews})
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <DurationIcon className="size-3.5" />
            {course.duration}
          </span>
          <span className="text-base font-semibold text-foreground">
            {course.price} €
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
    <button
      type="button"
      onClick={onSubscribeRequest}
      className={className}
    >
      <CourseCardContent course={course} isSubscribed={isSubscribed} />
    </button>
  );
}
