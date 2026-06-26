import { Suspense } from "react";

import { SubscribeContent } from "@/components/catalog/subscribe-content";
import { PageContainer } from "@/components/layout/page-container";

export default function SubscribePage() {
  return (
    <PageContainer
      size="narrow"
      className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center"
    >
      <Suspense
        fallback={
          <div className="text-sm text-muted-foreground">Chargement...</div>
        }
      >
        <SubscribeContent />
      </Suspense>
    </PageContainer>
  );
}
