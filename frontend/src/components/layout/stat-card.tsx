import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-2xl border border-border/50 bg-card p-5 shadow-soft",
        className,
      )}
    >
      {Icon ? (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
          <Icon className="size-5 text-brand-brown" />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 font-serif text-2xl font-semibold tracking-tight text-brand-brown-dark">
          {value}
        </p>
        {hint ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}
