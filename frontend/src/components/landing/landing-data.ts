export type CoursePlaceholder = {
  type: "PDF" | "Video";
  level: "Débutant" | "Intermédiaire" | "Avancé";
  category: string;
  rating: number;
  reviews: number;
  duration: string;
  image: string;
  authorName: string;
};

export const COURSE_PLACEHOLDERS: CoursePlaceholder[] = [
  {
    type: "PDF",
    level: "Débutant",
    category: "Design",
    rating: 4.8,
    reviews: 124,
    duration: "142 pages",
    image:
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop",
    authorName: "Camille Rousseau",
  },
  {
    type: "Video",
    level: "Intermédiaire",
    category: "Développement",
    rating: 4.9,
    reviews: 312,
    duration: "20h 30min",
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop",
    authorName: "Théo Lambert",
  },
  {
    type: "Video",
    level: "Intermédiaire",
    category: "Langues",
    rating: 4.7,
    reviews: 89,
    duration: "18h 15min",
    image:
      "https://images.unsplash.com/photo-1546410531-bb4caa6e4247?w=600&h=400&fit=crop",
    authorName: "Isabella Moreno",
  },
];

export const MOCK_COURSES = [
  {
    id: 1,
    title: "Travail de l'acier en Forge pour Débutants",
    description: null,
    instructorId: 1,
    instructorEmail: "camille.rousseau@example.com",
  },
  {
    id: 2,
    title: "Maîtriser React & TypeScript en 2024",
    description: null,
    instructorId: 2,
    instructorEmail: "theo.lambert@example.com",
  },
  {
    id: 3,
    title: "Espagnol B2 — Conversation & Grammaire",
    description: null,
    instructorId: 3,
    instructorEmail: "isabella.moreno@example.com",
  },
];

export function getInstructorLabel(email: string, fallback?: string) {
  if (fallback) {
    return fallback;
  }

  const local = email.split("@")[0] ?? email;
  const parts = local.split(/[._-]/);
  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const LEVEL_STYLES: Record<CoursePlaceholder["level"], string> = {
  Débutant: "bg-emerald-100 text-emerald-800",
  Intermédiaire: "bg-amber-100 text-amber-800",
  Avancé: "bg-rose-100 text-rose-800",
};
