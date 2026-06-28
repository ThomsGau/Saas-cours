import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type {
  CourseSummary,
  CreateCourseRequest,
  CreateLessonRequest,
  InstructorCourseDetail,
  Lesson,
  UpdateCourseRequest,
  UpdateLessonRequest,
} from "@/lib/api/types";

export async function listMyCourses(): Promise<CourseSummary[]> {
  return apiGet<CourseSummary[]>(apiEndpoints.instructors.myCourses);
}

export async function getMyCourse(
  courseId: number | string,
): Promise<InstructorCourseDetail> {
  return apiGet<InstructorCourseDetail>(apiEndpoints.instructors.myCourse(courseId));
}

export async function createCourse(
  request: CreateCourseRequest,
): Promise<InstructorCourseDetail> {
  return apiPost<InstructorCourseDetail>(apiEndpoints.instructors.myCourses, request);
}

export async function updateCourse(
  courseId: number | string,
  request: UpdateCourseRequest,
): Promise<InstructorCourseDetail> {
  return apiPatch<InstructorCourseDetail>(
    apiEndpoints.instructors.myCourse(courseId),
    request,
  );
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

export async function updateLesson(
  courseId: number | string,
  lessonId: number | string,
  request: UpdateLessonRequest,
): Promise<Lesson> {
  return apiPatch<Lesson>(
    apiEndpoints.instructors.updateMyCourseLesson(courseId, lessonId),
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
