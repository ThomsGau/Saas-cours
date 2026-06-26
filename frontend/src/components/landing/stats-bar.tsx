const stats = [
  { value: "200+", label: "Cours disponibles" },
  { value: "12 k", label: "Apprenants actifs" },
  { value: "4.8", label: "Note moyenne" },
  { value: "48", label: "Formateurs experts" },
];

export function StatsBar() {
  return (
    <section className="border-y border-border/50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-wide grid-cols-2 gap-8 md:grid-cols-4 md:gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-serif text-3xl font-semibold text-brand-brown-dark sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
