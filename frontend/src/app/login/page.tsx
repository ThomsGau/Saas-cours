import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { PageContainer } from "@/components/layout/page-container";

export default function LoginPage() {
  return (
    <PageContainer
      size="narrow"
      className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center py-10"
    >
      <Suspense
        fallback={
          <div className="text-sm text-muted-foreground">Chargement...</div>
        }
      >
        <LoginForm />
      </Suspense>
    </PageContainer>
  );
}
