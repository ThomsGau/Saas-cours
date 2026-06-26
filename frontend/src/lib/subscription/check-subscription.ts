import { listCourses } from "@/lib/api/catalog.service";
import { ApiError } from "@/lib/api/errors";

export async function isSubscriptionActive(): Promise<boolean> {
  try {
    await listCourses();
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      return false;
    }

    throw error;
  }
}
