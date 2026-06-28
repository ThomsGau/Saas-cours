import { apiGet } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { UserProfileResponse } from "@/lib/api/types";

export async function getProfile(): Promise<UserProfileResponse> {
  return apiGet<UserProfileResponse>(apiEndpoints.users.me);
}
