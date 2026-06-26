"use client";

import { getInstructorLabel } from "@/components/landing/landing-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatSlotCardDateTime } from "@/lib/format/datetime";
import type { AvailabilitySlot } from "@/lib/api/types";

type SessionSlotCardProps = {
  slot: AvailabilitySlot;
  isBooking: boolean;
  onBook: (slotId: number) => void;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function SessionSlotCard({
  slot,
  isBooking,
  onBook,
}: SessionSlotCardProps) {
  const displayName =
    slot.instructorDisplayName?.trim() ||
    getInstructorLabel(slot.instructorEmail, "Instructeur");
  const specialty = slot.instructorSpecialty ?? "Coaching";

  return (
    <article className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-soft">
      <Avatar size="lg" className="size-12 shrink-0">
        {slot.instructorAvatarUrl ? (
          <AvatarImage
            src={slot.instructorAvatarUrl}
            alt={displayName}
          />
        ) : null}
        <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {formatSlotCardDateTime(slot.startAt)}
        </p>
        <p className="truncate font-serif font-semibold text-brand-brown-dark">
          {displayName}
        </p>
        <p className="truncate text-sm text-muted-foreground">{specialty}</p>
      </div>

      <Button
        size="sm"
        className="shrink-0"
        disabled={isBooking}
        onClick={() => onBook(slot.id)}
      >
        {isBooking ? "Réservation..." : "Réserver"}
      </Button>
    </article>
  );
}
