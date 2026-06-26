import { RegisterForm } from "@/components/auth/register-form";
import { PageContainer } from "@/components/layout/page-container";

export default function RegisterPage() {
  return (
    <PageContainer
      size="narrow"
      className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center py-10"
    >
      <RegisterForm />
    </PageContainer>
  );
}
