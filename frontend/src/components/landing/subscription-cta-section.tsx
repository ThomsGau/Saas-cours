import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SubscriptionCtaSection() {
  return (
    <section className="px-4 pb-20 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-wide">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-brown-dark via-brand-brown to-[#5c3820] px-8 py-14 text-center shadow-soft-lg sm:px-16 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-orange-light">
            Accès illimité
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl font-serif text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Apprenez sans limites avec l&apos;abonnement Savoir-Pro
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
            Accès à l&apos;intégralité du catalogue — PDF et vidéos — pour
            19€/mois. Résiliable à tout moment.
          </p>
          <Link
            href="/subscribe"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-8 rounded-full bg-brand-orange-light px-8 text-white hover:bg-brand-orange-light/90",
            )}
          >
            Commencer l&apos;essai gratuit — 7 jours
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
