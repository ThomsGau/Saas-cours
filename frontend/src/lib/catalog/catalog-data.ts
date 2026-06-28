import type { CourseSummary } from "@/lib/api/types";
import { resolveCourseDurationLabel } from "@/lib/format/duration";

export type CatalogCourseType = "Video" | "PDF";

export type CatalogCourseLevel = "Débutant" | "Intermédiaire" | "Avancé";

export const COURSE_LEVELS: CatalogCourseLevel[] = [
  "Débutant",
  "Intermédiaire",
  "Avancé",
];

export type CatalogCourse = CourseSummary & {
  type: CatalogCourseType | null;
  level: CatalogCourseLevel;
  duration: string;
  image: string;
  authorName: string;
};

export const DEFAULT_VIDEO_IMAGE =
  "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop";

export const DEFAULT_PDF_IMAGE =
  "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop";

const DEFAULT_VIDEO_DURATION = "Durée non renseignée";
const DEFAULT_PDF_DURATION = "Document PDF";

function toCatalogCourseType(
  primaryLessonType: CourseSummary["primaryLessonType"],
): CatalogCourseType | null {
  if (primaryLessonType === "PDF") {
    return "PDF";
  }
  if (primaryLessonType === "VIDEO") {
    return "Video";
  }
  return null;
}

function resolveAuthorName(instructorEmail: string): string {
  const local = instructorEmail.split("@")[0] ?? instructorEmail;
  const parts = local.split(/[._-]/);
  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function mapApiCourses(apiCourses: CourseSummary[]): CatalogCourse[] {
  return apiCourses.map((apiCourse) => {
    const catalogType = toCatalogCourseType(apiCourse.primaryLessonType);

    return {
      ...apiCourse,
      type: catalogType,
      level: apiCourse.level,
      authorName: resolveAuthorName(apiCourse.instructorEmail),
      image:
        catalogType === "PDF"
          ? DEFAULT_PDF_IMAGE
          : catalogType === "Video"
            ? DEFAULT_VIDEO_IMAGE
            : DEFAULT_VIDEO_IMAGE,
      duration:
        catalogType === "PDF"
          ? DEFAULT_PDF_DURATION
          : resolveCourseDurationLabel(
              apiCourse.totalDurationMinutes,
              DEFAULT_VIDEO_DURATION,
            ),
    };
  });
}

export type CatalogSortOption = "title" | "level" | "duration";

const LEVEL_ORDER: Record<CatalogCourseLevel, number> = {
  Débutant: 0,
  Intermédiaire: 1,
  Avancé: 2,
};

function parseDurationMinutes(duration: string): number {
  const match = duration.match(/(\d+)h\s*(\d+)/);
  if (!match) {
    return 0;
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

export function filterAndSortCourses(
  courses: CatalogCourse[],
  options: {
    search: string;
    typeFilter: "all" | CatalogCourseType;
    sort: CatalogSortOption;
  },
): CatalogCourse[] {
  let result = [...courses];

  const query = options.search.trim().toLowerCase();
  if (query) {
    result = result.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.authorName.toLowerCase().includes(query) ||
        (course.description?.toLowerCase().includes(query) ?? false),
    );
  }

  if (options.typeFilter !== "all") {
    result = result.filter((course) => course.type === options.typeFilter);
  }

  switch (options.sort) {
    case "title":
      result.sort((a, b) => a.title.localeCompare(b.title, "fr"));
      break;
    case "level":
      result.sort(
        (a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level],
      );
      break;
    case "duration":
      result.sort(
        (a, b) =>
          parseDurationMinutes(b.duration) - parseDurationMinutes(a.duration),
      );
      break;
  }

  return result;
}
