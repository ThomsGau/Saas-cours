"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { SparklesIcon } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { apiPost } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/errors";
import type { CheckoutResponse } from "@/lib/api/types";

export function SubscribeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subscriptionRequired = searchParams.get("reason") === "required";
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/subscribe");
    }
  }, [router, status]);

  if (status === "loading") {
    return (
      <div className="w-full space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

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
    <div className="w-full space-y-6">
      <PageHeader
        title="Abonnement catalogue"
        description="Accédez à l'ensemble des cours vidéo et documents PDF de la plateforme."
        className="mb-0"
      />

      {subscriptionRequired ? (
        <Alert>
          <AlertTitle>Abonnement requis</AlertTitle>
          <AlertDescription>
            Un abonnement actif est nécessaire pour accéder au catalogue de
            cours.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="w-full shadow-soft-lg">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <SparklesIcon className="size-5" />
          </div>
          <CardTitle>Formule catalogue</CardTitle>
          <CardDescription>
            Tout le contenu pédagogique en un seul abonnement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ul className="space-y-2">
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
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={isLoading}
            onClick={() => void handleSubscribe()}
          >
            {isLoading ? "Redirection vers Stripe..." : "S'abonner"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            render={<Link href="/courses" />}
          >
            Retour au catalogue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
