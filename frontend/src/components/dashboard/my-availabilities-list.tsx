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
      <div className="space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
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
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Aucun créneau à venir.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {slots.map((slot) => (
        <li
          key={slot.id}
          className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-medium">{formatDateTime(slot.startAt)}</p>
            <p className="text-sm text-muted-foreground">
              {slot.durationMinutes} min
              {slot.booked ? " · Réservé" : " · Libre"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
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
