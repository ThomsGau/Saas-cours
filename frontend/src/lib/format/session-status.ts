import type { PrivateSession } from "@/lib/api/types";

const sessionStatusLabels: Record<PrivateSession["status"], string> = {
  REQUESTED: "En attente de paiement",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  COMPLETED: "Terminée",
  NO_SHOW: "Absence",
};

const sessionStatusVariants: Record<
  PrivateSession["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  REQUESTED: "outline",
  CONFIRMED: "default",
  CANCELLED: "destructive",
  COMPLETED: "secondary",
  NO_SHOW: "destructive",
};

export function getSessionStatusLabel(status: PrivateSession["status"]): string {
  return sessionStatusLabels[status];
}

export function getSessionStatusVariant(
  status: PrivateSession["status"],
): "default" | "secondary" | "destructive" | "outline" {
  return sessionStatusVariants[status];
}
