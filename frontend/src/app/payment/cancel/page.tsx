import Link from "next/link";
import { XCircleIcon } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PaymentCancelPage() {
  return (
    <PageContainer
      size="narrow"
      className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center"
    >
      <Card className="w-full shadow-soft-lg">
        <CardHeader className="items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <XCircleIcon className="size-7" />
          </div>
          <CardTitle className="text-xl">Paiement annulé</CardTitle>
          <CardDescription>
            Aucun prélèvement n&apos;a été effectué. Vous pouvez réessayer
            quand vous le souhaitez.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          Votre abonnement n&apos;a pas été activé.
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full" render={<Link href="/subscribe" />}>
            Réessayer l&apos;abonnement
          </Button>
          <Button variant="outline" className="w-full" render={<Link href="/" />}>
            Retour à l&apos;accueil
          </Button>
        </CardFooter>
      </Card>
    </PageContainer>
  );
}
