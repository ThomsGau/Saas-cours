import { GraduationCapIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type AuthFormCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  className?: string;
};

export function AuthFormCard({
  title,
  description,
  children,
  footer,
  className,
}: AuthFormCardProps) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-border/50 bg-card shadow-soft-xl",
        className,
      )}
    >
      <div className="border-b border-border/40 bg-gradient-to-b from-accent/40 via-accent/10 to-transparent px-6 py-8 text-center sm:px-8">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
          <GraduationCapIcon className="size-6" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="px-6 py-7 sm:px-8">{children}</div>

      <div className="border-t border-border/40 bg-secondary/30 px-6 py-5 sm:px-8">
        {footer}
      </div>
    </div>
  );
}

export const authFieldClassName =
  "h-11 border-border/60 bg-background shadow-soft placeholder:text-muted-foreground/60 focus-visible:border-primary/30 focus-visible:bg-background focus-visible:ring-primary/15";

export const authSelectTriggerClassName =
  "h-11 w-full border-border/60 bg-background shadow-soft focus-visible:border-primary/30 focus-visible:ring-primary/15";
