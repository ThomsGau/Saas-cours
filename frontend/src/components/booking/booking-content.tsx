"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";

import { SessionSlotCard } from "@/components/booking/session-slot-card";
import { EmptyState } from "@/components/layout/empty-state";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { bookSlot } from "@/lib/api/booking.service";
import { listAvailableSlots } from "@/lib/api/instructor.service";
import { createPrivateSessionCheckout } from "@/lib/api/payments.service";
import { ApiError } from "@/lib/api/errors";
import type { AvailabilitySlot } from "@/lib/api/types";

function BookingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function BookingContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingSlotId, setBookingSlotId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSlots = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await listAvailableSlots();
      setSlots(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible de charger les créneaux.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/booking");
      return;
    }

    if (session?.user.role !== "STUDENT") {
      return;
    }

    void loadSlots();
  }, [loadSlots, router, session?.user.role, status]);

  if (status === "loading" || isLoading) {
    return <BookingSkeleton />;
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (session?.user.role !== "STUDENT") {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Réservation réservée aux élèves</CardTitle>
          <CardDescription>
            En tant qu&apos;instructeur, gérez vos créneaux et sessions depuis
            le dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/dashboard" />}>Aller au dashboard</Button>
        </CardContent>
      </Card>
    );
  }

  async function handleBook(slotId: number) {
    setBookingSlotId(slotId);

    try {
      const privateSession = await bookSlot({ availabilitySlotId: slotId });

      try {
        const checkout = await createPrivateSessionCheckout(privateSession.id);
        window.location.href = checkout.checkoutUrl;
      } catch (checkoutError) {
        await loadSlots();
        const message =
          checkoutError instanceof ApiError
            ? checkoutError.message
            : "Impossible de démarrer le paiement.";

        toast.error("Paiement impossible", {
          description: message,
          action: {
            label: "Dashboard",
            onClick: () => router.push("/dashboard"),
          },
        });
        setBookingSlotId(null);
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Impossible de réserver ce créneau.";

      toast.error("Réservation échouée", { description: message });
      setBookingSlotId(null);
    }
  }

  return (
    <div className="space-y-6">
      {errorMessage ? (
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {slots.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="Aucun créneau libre"
          description="Aucun coach n'a de disponibilités pour le moment."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {slots.map((slot) => (
            <SessionSlotCard
              key={slot.id}
              slot={slot}
              isBooking={bookingSlotId === slot.id}
              onBook={(slotId) => void handleBook(slotId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
