"use client";

import { useState } from "react";
import { SparklesIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiPost } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/errors";
import type { CheckoutResponse } from "@/lib/api/types";

type SubscribeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SubscribeDialog({ open, onOpenChange }: SubscribeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubscribe() {
    setIsLoading(true);

    try {
      const response = await apiPost<CheckoutResponse>(
        apiEndpoints.payments.subscriptionCheckout,
      );

      window.location.href = response.checkoutUrl;
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Impossible de démarrer le paiement.";

      toast.error("Paiement impossible", { description: message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <SparklesIcon className="size-5" />
          </div>
          <DialogTitle>Débloquez le catalogue</DialogTitle>
          <DialogDescription>
            Abonnez-vous pour accéder à l&apos;ensemble des cours vidéo et
            documents PDF de la plateforme.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            Cours vidéo à la demande
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            Documents PDF téléchargeables
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            Accès tant que l&apos;abonnement est actif
          </li>
        </ul>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Fermer
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            onClick={() => void handleSubscribe()}
          >
            {isLoading ? "Redirection vers Stripe..." : "S'abonner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
