export function formatCourseVideoDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}min`;
}

export function resolveCourseDurationLabel(
  totalDurationMinutes: number | null | undefined,
  fallback: string,
): string {
  if (totalDurationMinutes != null && totalDurationMinutes > 0) {
    return formatCourseVideoDuration(totalDurationMinutes);
  }
  return fallback;
}
