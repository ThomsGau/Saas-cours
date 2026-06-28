import type { CourseLevel } from "@/lib/api/types";

export function getInstructorLabel(email: string, fallback?: string) {
  if (fallback) {
    return fallback;
  }

  const local = email.split("@")[0] ?? email;
  const parts = local.split(/[._-]/);
  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const LEVEL_STYLES: Record<CourseLevel, string> = {
  Débutant: "bg-emerald-100 text-emerald-800",
  Intermédiaire: "bg-amber-100 text-amber-800",
  Avancé: "bg-rose-100 text-rose-800",
};
