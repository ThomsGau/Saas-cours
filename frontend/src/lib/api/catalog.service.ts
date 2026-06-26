import { apiGet } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { CourseDetail, CourseSummary, Lesson } from "@/lib/api/types";

export async function listCourses(): Promise<CourseSummary[]> {
  return apiGet<CourseSummary[]>(apiEndpoints.catalog.courses);
}

export async function getCourse(courseId: number | string): Promise<CourseDetail> {
  return apiGet<CourseDetail>(apiEndpoints.catalog.course(courseId));
}

export async function getLesson(
  courseId: number | string,
  lessonId: number | string,
): Promise<Lesson> {
  return apiGet<Lesson>(apiEndpoints.catalog.lesson(courseId, lessonId));
}
