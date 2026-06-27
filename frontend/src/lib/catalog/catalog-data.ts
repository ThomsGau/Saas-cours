import type { CourseSummary } from "@/lib/api/types";

export type CatalogCourseType = "Video" | "PDF";

export type CatalogCourseLevel = "Débutant" | "Intermédiaire" | "Avancé";

export type CatalogCourse = CourseSummary & {
  type: CatalogCourseType;
  level: CatalogCourseLevel;
  category: string;
  rating: number;
  reviews: number;
  duration: string;
  price: number;
  image: string;
  authorName: string;
  bestseller?: boolean;
};

export const CATALOG_CATEGORIES = [
  "Design",
  "Développement",
  "Marketing",
  "Photographie",
  "Business",
  "Langues",
] as const;

export const CATALOG_COURSES: CatalogCourse[] = [
  {
    id: 1,
    title: "UI/UX Design — Figma de A à Z",
    description: null,
    instructorId: 1,
    instructorEmail: "nathalie.girard@example.com",
    type: "Video",
    level: "Débutant",
    category: "Design",
    rating: 4.9,
    reviews: 412,
    duration: "18h 45min",
    price: 54,
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop",
    authorName: "Nathalie Girard",
    bestseller: true,
  },
  {
    id: 2,
    title: "Espagnol B2 — Conversation & Grammaire",
    description: null,
    instructorId: 2,
    instructorEmail: "isabella.moreno@example.com",
    type: "Video",
    level: "Intermédiaire",
    category: "Langues",
    rating: 4.7,
    reviews: 289,
    duration: "38h 00min",
    price: 49,
    image:
      "https://images.unsplash.com/photo-1546410531-bb4caa6e4247?w=600&h=400&fit=crop",
    authorName: "Isabella Moreno",
    bestseller: true,
  },
  {
    id: 3,
    title: "Photographie de Portrait — Lumière & Composition",
    description: null,
    instructorId: 3,
    instructorEmail: "marc.dupont@example.com",
    type: "Video",
    level: "Intermédiaire",
    category: "Photographie",
    rating: 4.8,
    reviews: 156,
    duration: "14h 20min",
    price: 45,
    image:
      "https://images.unsplash.com/photo-1554048612-b6a482bb27e2?w=600&h=400&fit=crop",
    authorName: "Marc Dupont",
  },
  {
    id: 4,
    title: "Marketing Digital — Stratégie & Réseaux Sociaux",
    description: null,
    instructorId: 4,
    instructorEmail: "sophie.martin@example.com",
    type: "Video",
    level: "Débutant",
    category: "Marketing",
    rating: 4.6,
    reviews: 203,
    duration: "22h 10min",
    price: 52,
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    authorName: "Sophie Martin",
    bestseller: true,
  },
  {
    id: 5,
    title: "Guide Complet du SEO — Référencement Naturel",
    description: null,
    instructorId: 5,
    instructorEmail: "julien.bernard@example.com",
    type: "PDF",
    level: "Intermédiaire",
    category: "Marketing",
    rating: 4.5,
    reviews: 178,
    duration: "220 pages",
    price: 35,
    image:
      "https://images.unsplash.com/photo-1432888622747-4eb9ef8eb70a?w=600&h=400&fit=crop",
    authorName: "Julien Bernard",
  },
  {
    id: 6,
    title: "Python pour la Data Science",
    description: null,
    instructorId: 6,
    instructorEmail: "theo.lambert@example.com",
    type: "PDF",
    level: "Intermédiaire",
    category: "Développement",
    rating: 4.8,
    reviews: 334,
    duration: "192 pages",
    price: 38,
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop",
    authorName: "Théo Lambert",
  },
  {
    id: 7,
    title: "Maîtriser React & TypeScript en 2024",
    description: null,
    instructorId: 7,
    instructorEmail: "alexandre.petit@example.com",
    type: "Video",
    level: "Avancé",
    category: "Développement",
    rating: 4.9,
    reviews: 521,
    duration: "32h 15min",
    price: 59,
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop",
    authorName: "Alexandre Petit",
    bestseller: true,
  },
  {
    id: 8,
    title: "Créer son Business en Ligne — De l'idée au lancement",
    description: null,
    instructorId: 8,
    instructorEmail: "claire.renard@example.com",
    type: "PDF",
    level: "Débutant",
    category: "Business",
    rating: 4.4,
    reviews: 97,
    duration: "156 pages",
    price: 32,
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop",
    authorName: "Claire Renard",
  },
  {
    id: 9,
    title: "Design Graphique — Adobe Illustrator Pro",
    description: null,
    instructorId: 9,
    instructorEmail: "camille.rousseau@example.com",
    type: "Video",
    level: "Intermédiaire",
    category: "Design",
    rating: 4.7,
    reviews: 245,
    duration: "16h 30min",
    price: 47,
    image:
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=400&fit=crop",
    authorName: "Camille Rousseau",
  },
];

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

function pickPlaceholder(
  primaryLessonType: CourseSummary["primaryLessonType"],
  index: number,
): CatalogCourse {
  const catalogType = toCatalogCourseType(primaryLessonType);
  const pool =
    catalogType !== null
      ? CATALOG_COURSES.filter((course) => course.type === catalogType)
      : CATALOG_COURSES;

  return pool[index % pool.length] ?? CATALOG_COURSES[index % CATALOG_COURSES.length];
}

export function mergeApiCourses(apiCourses: CourseSummary[]): CatalogCourse[] {
  if (apiCourses.length === 0) {
    return CATALOG_COURSES;
  }

  return apiCourses.map((apiCourse, index) => {
    const placeholder = pickPlaceholder(apiCourse.primaryLessonType, index);
    const catalogType = toCatalogCourseType(apiCourse.primaryLessonType);

    return {
      ...placeholder,
      id: apiCourse.id,
      title: apiCourse.title,
      description: apiCourse.description,
      instructorId: apiCourse.instructorId,
      instructorEmail: apiCourse.instructorEmail,
      ...(catalogType !== null
        ? {
            type: catalogType,
            image: placeholder.image,
            duration: placeholder.duration,
          }
        : {}),
    };
  });
}

export type CatalogSortOption = "popular" | "rating" | "price-asc" | "price-desc";

export function filterAndSortCourses(
  courses: CatalogCourse[],
  options: {
    search: string;
    typeFilter: "all" | CatalogCourseType;
    categoryFilter: string;
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
        course.category.toLowerCase().includes(query),
    );
  }

  if (options.typeFilter !== "all") {
    result = result.filter((course) => course.type === options.typeFilter);
  }

  if (options.categoryFilter !== "all") {
    result = result.filter(
      (course) => course.category === options.categoryFilter,
    );
  }

  switch (options.sort) {
    case "popular":
      result.sort((a, b) => b.rating * b.reviews - a.rating * a.reviews);
      break;
    case "rating":
      result.sort((a, b) => b.rating - a.rating);
      break;
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
  }

  return result;
}
