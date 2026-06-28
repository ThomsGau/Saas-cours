"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { CourseList } from "@/components/catalog/course-list";
import { SubscribeDialog } from "@/components/catalog/subscribe-dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { listCourses } from "@/lib/api/catalog.service";
import { getProfile } from "@/lib/api/user.service";
import { ApiError } from "@/lib/api/errors";
import {
  filterAndSortCourses,
  mapApiCourses,
  type CatalogCourse,
  type CatalogCourseType,
  type CatalogSortOption,
} from "@/lib/catalog/catalog-data";

function CourseListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-11 w-full rounded-full" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-24 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft"
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
    </div>
  );
}

export function CoursesContent() {
  const router = useRouter();
  const { status } = useSession();
  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | CatalogCourseType>("all");
  const [sort, setSort] = useState<CatalogSortOption>("title");

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/courses");
      return;
    }

    let cancelled = false;

    async function loadCatalog() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        let profile;
        try {
          profile = await getProfile();
        } catch (error) {
          if (cancelled) {
            return;
          }

          if (error instanceof ApiError && error.status === 401) {
            router.replace("/login?callbackUrl=/courses");
            return;
          }

          throw error;
        }

        if (cancelled) {
          return;
        }

        setIsSubscribed(profile.subscriptionStatus === "ACTIVE");

        try {
          const apiCourses = await listCourses();
          if (cancelled) {
            return;
          }
          setCourses(mapApiCourses(apiCourses));
        } catch (error) {
          if (cancelled) {
            return;
          }

          if (error instanceof ApiError && error.status === 403) {
            setIsSubscribed(false);
            setCourses([]);
            return;
          }

          if (error instanceof ApiError && error.status === 401) {
            router.replace("/login?callbackUrl=/courses");
            return;
          }

          throw error;
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Impossible de charger le catalogue.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadCatalog();

    return () => {
      cancelled = true;
    };
  }, [router, status]);

  const filteredCourses = useMemo(
    () =>
      filterAndSortCourses(courses, {
        search,
        typeFilter,
        sort,
      }),
    [courses, search, typeFilter, sort],
  );

  if (status === "loading" || isLoading) {
    return <CourseListSkeleton />;
  }

  if (errorMessage) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <CatalogFilters
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        sort={sort}
        onSortChange={setSort}
        resultsCount={filteredCourses.length}
      />

      <CourseList
        courses={filteredCourses}
        isSubscribed={isSubscribed}
        onSubscribeRequest={() => setSubscribeDialogOpen(true)}
      />

      <SubscribeDialog
        open={subscribeDialogOpen}
        onOpenChange={setSubscribeDialogOpen}
      />
    </div>
  );
}
