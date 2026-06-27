type DashboardWelcomeProps = {
  displayName: string | null | undefined;
};

function getFirstName(displayName: string | null | undefined): string {
  const trimmed = displayName?.trim();
  if (!trimmed) {
    return "Apprenant";
  }

  return trimmed.split(/\s+/)[0] ?? trimmed;
}

export function DashboardWelcome({ displayName }: DashboardWelcomeProps) {
  const firstName = getFirstName(displayName);

  return (
    <div className="space-y-1">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-brand-brown-dark sm:text-4xl">
        Bonjour, {firstName}
      </h1>
      <p className="text-sm text-muted-foreground sm:text-base">
        Voici un aperçu de votre apprentissage.
      </p>
    </div>
  );
}
