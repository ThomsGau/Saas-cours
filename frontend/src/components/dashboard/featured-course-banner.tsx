"use client";

import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CourseSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type FeaturedCourseBannerProps = {
  isLoading: boolean;
  isSubscriptionActive: boolean;
  course: CourseSummary | null;
};

export function FeaturedCourseBanner({
  isLoading,
  isSubscriptionActive,
  course,
}: FeaturedCourseBannerProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-brand-brown p-6 shadow-soft-lg sm:p-8">
        <Skeleton className="h-4 w-40 bg-primary-foreground/20" />
        <Skeleton className="mt-4 h-8 w-3/4 bg-primary-foreground/20" />
        <Skeleton className="mt-3 h-4 w-full max-w-md bg-primary-foreground/20" />
        <Skeleton className="mt-6 h-9 w-36 rounded-full bg-primary-foreground/20" />
      </div>
    );
  }

  if (!isSubscriptionActive) {
    return (
      <section className="rounded-2xl bg-brand-brown p-6 text-primary-foreground shadow-soft-lg sm:p-8">
        <span className="inline-flex rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium uppercase tracking-wide">
          Catalogue
        </span>
        <h2 className="mt-4 font-serif text-2xl font-semibold sm:text-3xl">
          Accédez à tous les cours vidéo et PDF
        </h2>
        <p className="mt-2 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
          Abonnez-vous pour débloquer le catalogue complet et accélérer votre
          apprentissage.
        </p>
        <Link
          href="/subscribe"
          className={cn(
            buttonVariants({ size: "sm" }),
            "mt-6 rounded-full bg-secondary text-brand-brown hover:bg-secondary/90",
          )}
        >
          S&apos;abonner
          <ArrowRightIcon className="size-4" />
        </Link>
      </section>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <section className="rounded-2xl bg-brand-brown p-6 text-primary-foreground shadow-soft-lg sm:p-8">
      <span className="inline-flex rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium uppercase tracking-wide">
        Recommandé pour vous
      </span>
      <h2 className="mt-4 font-serif text-2xl font-semibold sm:text-3xl">
        {course.title}
      </h2>
      <p className="mt-2 max-w-xl text-sm text-primary-foreground/80 sm:text-base line-clamp-2">
        {course.description ??
          "Découvrez ce cours du catalogue et progressez à votre rythme."}
      </p>
      <Link
        href={`/courses/${course.id}`}
        className={cn(
          buttonVariants({ size: "sm" }),
          "mt-6 rounded-full bg-secondary text-brand-brown hover:bg-secondary/90",
        )}
      >
        Découvrir le cours
        <ArrowRightIcon className="size-4" />
      </Link>
    </section>
  );
}
