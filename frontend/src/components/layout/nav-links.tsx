"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenIcon,
  CalendarIcon,
  HomeIcon,
  LayoutDashboardIcon,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { href: "/", label: "Accueil", icon: HomeIcon },
  { href: "/courses", label: "Catalogue", icon: BookOpenIcon },
  { href: "/booking", label: "Réservation", icon: CalendarIcon },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
];

export function isNavActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
}

type NavLinksProps = {
  orientation?: "horizontal" | "vertical";
  onNavigate?: () => void;
  className?: string;
};

export function NavLinks({
  orientation = "horizontal",
  onNavigate,
  className,
}: NavLinksProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        orientation === "horizontal"
          ? "flex items-center gap-1"
          : "flex flex-col gap-1",
        className,
      )}
    >
      {navItems.map((item) => {
        const active = isNavActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              orientation === "vertical" && "w-full",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {orientation === "vertical" ? (
              <item.icon className="size-4 shrink-0" />
            ) : null}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
