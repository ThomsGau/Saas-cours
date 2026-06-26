"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { InstructorDashboard } from "@/components/dashboard/instructor-dashboard";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

export function DashboardContent() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/dashboard");
    }
  }, [router, status]);

  if (status === "loading") {
    return <DashboardSkeleton />;
  }

  if (status === "unauthenticated" || !session) {
    return null;
  }

  const role = session.user.role;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={`Connecté en tant que ${session.user.email} (${role})`}
      />

      {role === "STUDENT" ? (
        <StudentDashboard />
      ) : role === "INSTRUCTOR" ? (
        <InstructorDashboard />
      ) : (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Espace administrateur</CardTitle>
            <CardDescription>
              Le tableau de bord admin dédié n&apos;est pas encore disponible.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Utilisez les autres sections de l&apos;application pour gérer le
            contenu.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
