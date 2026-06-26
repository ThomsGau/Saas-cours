import Link from "next/link";
import { ArrowRightIcon, CalendarIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] flex-col justify-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 size-[480px] rounded-full bg-[#e8d5c4]/50 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 size-[480px] rounded-full bg-[#e8d5c4]/40 blur-3xl"
      />

      <div className="relative mx-auto max-w-3xl space-y-8 text-center">
        <span className="inline-flex rounded-full border border-border/60 bg-card/80 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
          + de 200 cours vidéo et PDF disponibles
        </span>

        <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          <span className="text-brand-brown-dark">
            Apprenez en ligne,
            <span className="ml-1 inline-block h-[1em] w-0.5 animate-pulse bg-brand-brown-dark align-middle" />
          </span>
          <br />
          <span className="text-brand-orange">réservez en direct.</span>
        </h1>

        <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Un catalogue de cours vidéo à l&apos;infini, plus des sessions privées
          avec des coachs experts — tout en un.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/courses"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 rounded-full bg-brand-brown px-8 text-primary-foreground hover:bg-brand-brown/90",
            )}
          >
            Explorer le catalogue
            <ArrowRightIcon className="size-4" />
          </Link>
          <Link
            href="/booking"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 rounded-full border-border/80 bg-card/60 px-8 hover:bg-card",
            )}
          >
            <CalendarIcon className="size-4" />
            Réserver une session
          </Link>
        </div>
      </div>
    </section>
  );
}
