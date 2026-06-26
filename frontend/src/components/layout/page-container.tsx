import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
};

const sizeClasses = {
  default: "max-w-page",
  narrow: "max-w-narrow",
  wide: "max-w-wide",
};

export function PageContainer({
  children,
  className,
  size = "default",
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-8 sm:px-6 lg:px-8 lg:py-10",
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </div>
  );
}
