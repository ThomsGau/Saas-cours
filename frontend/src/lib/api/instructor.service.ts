import { apiDelete, apiGet, apiPost } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type {
  AvailabilitySlot,
  CreateAvailabilityRequest,
  InstructorSummary,
} from "@/lib/api/types";

export async function listInstructors(): Promise<InstructorSummary[]> {
  return apiGet<InstructorSummary[]>(apiEndpoints.instructors.list);
}

export async function listInstructorAvailabilities(
  instructorId: number | string,
): Promise<AvailabilitySlot[]> {
  return apiGet<AvailabilitySlot[]>(
    apiEndpoints.instructors.availabilities(instructorId),
  );
}

export async function listMyAvailabilities(): Promise<AvailabilitySlot[]> {
  return apiGet<AvailabilitySlot[]>(apiEndpoints.instructors.myAvailabilities);
}

export async function createAvailability(
  request: CreateAvailabilityRequest,
): Promise<AvailabilitySlot> {
  return apiPost<AvailabilitySlot>(
    apiEndpoints.instructors.myAvailabilities,
    request,
  );
}

export async function deleteAvailability(slotId: number | string): Promise<void> {
  await apiDelete(apiEndpoints.instructors.deleteMyAvailability(slotId));
}
