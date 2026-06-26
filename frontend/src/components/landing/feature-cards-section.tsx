import Link from "next/link";
import { ArrowRightIcon, BookOpenIcon, CalendarIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FeatureCardsSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-wide gap-5 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-brown-dark via-brand-brown to-[#5c3820] p-8 shadow-soft-lg sm:p-10">
          <div className="relative z-10 max-w-md space-y-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-white">
              <BookOpenIcon className="size-5" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
              Catalogue de cours
            </h3>
            <p className="text-sm leading-relaxed text-white/75 sm:text-base">
              Vidéos et PDFs accessibles avec un abonnement à vie. Plus de 100
              ressources dans 8 domaines.
            </p>
            <Link
              href="/courses"
              className={cn(
                buttonVariants({ size: "default" }),
                "rounded-full bg-brand-orange-light px-6 text-white hover:bg-brand-orange-light/90",
              )}
            >
              Explorer
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-brand-beige p-8 shadow-soft sm:p-10">
          <div className="max-w-md space-y-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-brand-brown/10 text-brand-brown">
              <CalendarIcon className="size-5" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-brand-brown-dark sm:text-3xl">
              Sessions privées
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Echangez en direct avec un coach expert. Créneaux disponibles
              7j/7, réservation en quelques clics.
            </p>
            <Link
              href="/booking"
              className={cn(
                buttonVariants({ size: "default" }),
                "rounded-full bg-brand-brown px-6 text-primary-foreground hover:bg-brand-brown/90",
              )}
            >
              Réserver un créneau
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
