import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { ApiError } from "@/lib/api/errors";

export function handleCatalogError(
  error: unknown,
  router: AppRouterInstance,
  callbackUrl: string,
): boolean {
  if (!(error instanceof ApiError)) {
    return false;
  }

  if (error.status === 403) {
    router.push("/subscribe?reason=required");
    return true;
  }

  if (error.status === 401) {
    router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    return true;
  }

  return false;
}
