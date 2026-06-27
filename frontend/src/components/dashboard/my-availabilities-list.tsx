"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  deleteAvailability,
  listMyAvailabilities,
} from "@/lib/api/instructor.service";
import { ApiError } from "@/lib/api/errors";
import { formatDateTime } from "@/lib/format/datetime";
import type { AvailabilitySlot } from "@/lib/api/types";

type MyAvailabilitiesListProps = {
  refreshKey?: number;
};

export function MyAvailabilitiesList({ refreshKey = 0 }: MyAvailabilitiesListProps) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingSlotId, setDeletingSlotId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSlots = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await listMyAvailabilities();
      setSlots(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible de charger vos créneaux.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots, refreshKey]);

  async function handleDelete(slotId: number) {
    setDeletingSlotId(slotId);

    try {
      await deleteAvailability(slotId);
      toast.success("Créneau supprimé");
      await loadSlots();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Impossible de supprimer ce créneau.";

      toast.error("Suppression échouée", { description: message });
    } finally {
      setDeletingSlotId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-0 divide-y divide-border/40">
        <Skeleton className="h-14 w-full rounded-none" />
        <Skeleton className="h-14 w-full rounded-none" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {errorMessage}
      </p>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
        Aucun créneau à venir.
      </p>
    );
  }

  return (
    <ul>
      {slots.map((slot) => (
        <li
          key={slot.id}
          className="flex flex-col gap-3 border-b border-border/40 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="font-medium text-foreground">
              {formatDateTime(slot.startAt)}
            </p>
            <p className="text-sm text-muted-foreground">
              {slot.durationMinutes} min
              {slot.booked ? " · Réservé" : " · Libre"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 bg-card"
            disabled={slot.booked || deletingSlotId === slot.id}
            onClick={() => void handleDelete(slot.id)}
          >
            {deletingSlotId === slot.id ? "Suppression..." : "Supprimer"}
          </Button>
        </li>
      ))}
    </ul>
  );
}
