"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

import { BestsellerCourseCard } from "@/components/landing/bestseller-course-card";
import {
  COURSE_PLACEHOLDERS,
  MOCK_COURSES,
} from "@/components/landing/landing-data";
import { Skeleton } from "@/components/ui/skeleton";
import { listCourses } from "@/lib/api/catalog.service";
import type { CourseSummary } from "@/lib/api/types";

function BestsellersSkeleton() {
  return (
    <div className="flex gap-5 overflow-hidden pb-2 sm:grid sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="w-[min(100%,320px)] shrink-0 overflow-hidden rounded-2xl border border-border/50 bg-card sm:w-auto"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BestsellersSection() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      setIsLoading(true);

      try {
        const data = await listCourses();
        if (!cancelled) {
          setCourses(data.slice(0, 3));
        }
      } catch {
        if (!cancelled) {
          setCourses(MOCK_COURSES);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadCourses();

    return () => {
      cancelled = true;
    };
  }, []);

  const displayCourses =
    courses.length > 0 ? courses.slice(0, 3) : MOCK_COURSES;

  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-wide">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-orange">
              Bestsellers
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-brand-brown-dark sm:text-4xl">
              Cours les plus populaires
            </h2>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-orange transition-colors hover:text-brand-orange-light"
          >
            Voir tout
            <ChevronRightIcon className="size-4" />
          </Link>
        </div>

        {isLoading ? (
          <BestsellersSkeleton />
        ) : (
          <div className="flex gap-5 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible">
            {displayCourses.map((course, index) => (
              <BestsellerCourseCard
                key={course.id}
                course={course}
                placeholder={
                  COURSE_PLACEHOLDERS[index % COURSE_PLACEHOLDERS.length]
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
