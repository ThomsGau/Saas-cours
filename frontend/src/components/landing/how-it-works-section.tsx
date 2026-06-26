import {
  CalendarIcon,
  SparklesIcon,
  VideoIcon,
  type LucideIcon,
} from "lucide-react";

const steps: {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    number: "01",
    icon: SparklesIcon,
    title: "Créez votre compte",
    description:
      "Inscrivez-vous en quelques secondes pour accéder à l'intégralité.",
  },
  {
    number: "02",
    icon: VideoIcon,
    title: "Accédez au catalogue",
    description:
      "Abonnez-vous pour visionner les cours vidéo et télécharger les PDF.",
  },
  {
    number: "03",
    icon: CalendarIcon,
    title: "Réservez en direct",
    description:
      "Choisissez un créneau et échangez en direct avec un coach.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-wide">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-orange">
            Simple &amp; rapide
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-brand-brown-dark sm:text-4xl">
            Comment ça marche
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3 md:gap-0">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative rounded-2xl bg-brand-beige/60 p-8 md:rounded-none md:bg-transparent md:px-10 md:py-6"
            >
              {index > 0 ? (
                <div
                  aria-hidden
                  className="absolute left-0 top-1/2 hidden h-24 w-px -translate-y-1/2 bg-border/60 md:block"
                />
              ) : null}

              <span className="font-serif text-5xl font-semibold text-brand-brown/15">
                {step.number}
              </span>

              <div className="mt-4 flex size-10 items-center justify-center rounded-lg bg-brand-brown/10 text-brand-brown">
                <step.icon className="size-5" />
              </div>

              <h3 className="mt-4 font-semibold text-brand-brown-dark">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
