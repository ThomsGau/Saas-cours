import { apiDelete, apiGet, apiPost } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type {
  CourseDetail,
  CourseSummary,
  CreateCourseRequest,
  CreateLessonRequest,
  Lesson,
} from "@/lib/api/types";

export async function listMyCourses(): Promise<CourseSummary[]> {
  return apiGet<CourseSummary[]>(apiEndpoints.instructors.myCourses);
}

export async function getMyCourse(
  courseId: number | string,
): Promise<CourseDetail> {
  return apiGet<CourseDetail>(apiEndpoints.instructors.myCourse(courseId));
}

export async function createCourse(
  request: CreateCourseRequest,
): Promise<CourseDetail> {
  return apiPost<CourseDetail>(apiEndpoints.instructors.myCourses, request);
}

export async function addLesson(
  courseId: number | string,
  request: CreateLessonRequest,
): Promise<Lesson> {
  return apiPost<Lesson>(
    apiEndpoints.instructors.myCourseLessons(courseId),
    request,
  );
}

export async function deleteLesson(
  courseId: number | string,
  lessonId: number | string,
): Promise<void> {
  await apiDelete(apiEndpoints.instructors.deleteMyCourseLesson(courseId, lessonId));
}

export async function deleteCourse(courseId: number | string): Promise<void> {
  await apiDelete(apiEndpoints.instructors.deleteMyCourse(courseId));
}
