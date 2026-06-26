import { apiPost } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { CheckoutResponse } from "@/lib/api/types";

export async function createPrivateSessionCheckout(
  sessionId: number | string,
): Promise<CheckoutResponse> {
  return apiPost<CheckoutResponse>(
    apiEndpoints.payments.privateSessionCheckout(sessionId),
  );
}
