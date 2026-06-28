import { getProfile } from "@/lib/api/user.service";

export async function isSubscriptionActive(): Promise<boolean> {
  const profile = await getProfile();
  return profile.subscriptionStatus === "ACTIVE";
}
