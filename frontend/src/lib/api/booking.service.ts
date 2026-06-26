import { apiGet, apiPost } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { BookSlotRequest, PrivateSession } from "@/lib/api/types";

export async function bookSlot(
  request: BookSlotRequest,
): Promise<PrivateSession> {
  return apiPost<PrivateSession>(apiEndpoints.bookings.create, request);
}

export async function listMyBookings(): Promise<PrivateSession[]> {
  return apiGet<PrivateSession[]>(apiEndpoints.bookings.mine);
}

export async function listInstructorSessions(): Promise<PrivateSession[]> {
  return apiGet<PrivateSession[]>(apiEndpoints.bookings.instructorMine);
}
