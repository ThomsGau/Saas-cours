import { AppHeader } from "@/components/layout/app-header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-wide px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-muted-foreground">
            © Tout Droits Réservés — Cours en ligne &amp; accompagnement
          </p>
        </div>
      </footer>
    </div>
  );
}
