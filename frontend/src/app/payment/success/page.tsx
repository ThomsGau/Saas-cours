import Link from "next/link";
import { CheckCircle2Icon } from "lucide-react";

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

export default function PaymentSuccessPage() {
  return (
    <PageContainer
      size="narrow"
      className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center"
    >
      <Card className="w-full shadow-soft-lg">
        <CardHeader className="items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <CheckCircle2Icon className="size-7" />
          </div>
          <CardTitle className="text-xl">Paiement confirmé</CardTitle>
          <CardDescription>
            Votre abonnement sera activé sous peu. Vous pouvez accéder au
            catalogue dès que le statut est mis à jour.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          Si le catalogue n&apos;est pas encore accessible, actualisez la page
          dans quelques instants.
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full" render={<Link href="/courses" />}>
            Accéder au catalogue
          </Button>
          <Button variant="outline" className="w-full" render={<Link href="/" />}>
            Retour à l&apos;accueil
          </Button>
        </CardFooter>
      </Card>
    </PageContainer>
  );
}
