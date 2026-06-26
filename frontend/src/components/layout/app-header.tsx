"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { MenuIcon } from "lucide-react";

import { NavLinks } from "@/components/layout/nav-links";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { clearAccessToken } from "@/lib/api/token-store";
import { cn } from "@/lib/utils";

function getAccountLabel(displayName: string | null | undefined): string {
  const trimmedName = displayName?.trim();
  if (trimmedName) {
    return trimmedName;
  }

  return "Mon compte";
}

export function AppHeader() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const accountLabel = getAccountLabel(session?.user.displayName);

  async function handleSignOut() {
    clearAccessToken();
    await signOut({ callbackUrl: "/" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="relative mx-auto grid h-16 max-w-wide grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 text-foreground transition-opacity hover:opacity-80"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-brand-brown text-sm font-semibold text-primary-foreground">
            S
          </span>
          <span className="font-serif text-lg font-semibold tracking-tight">
            SaaS Cours
          </span>
        </Link>

        <NavLinks className="hidden md:flex" />

        <div className="ml-auto flex items-center justify-end gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
              >
                {accountLabel}
              </Link>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
              >
                Se Déconnecter
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "hidden sm:inline-flex",
                )}
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Inscription
              </Link>
            </>
          )}

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                  aria-label="Ouvrir le menu"
                />
              }
            >
              <MenuIcon className="size-4" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-6">
                <NavLinks orientation="vertical" />
                <div className="border-t border-border pt-4">
                  {isAuthenticated ? (
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/dashboard"
                        className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                      >
                        {accountLabel}
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => void handleSignOut()}
                      >
                        Se Déconnecter
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/login"
                        className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                      >
                        Connexion
                      </Link>
                      <Link
                        href="/register"
                        className={cn(buttonVariants(), "w-full")}
                      >
                        Inscription
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
