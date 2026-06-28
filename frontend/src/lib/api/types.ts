export type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export type SubscriptionStatus =
  | "NONE"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELLED"
  | "EXPIRED";

export type ApiErrorResponse = {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  fieldErrors?: Record<string, string> | null;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  email: string;
  role: Role;
  displayName: string | null;
};

export type UserProfileResponse = {
  email: string;
  role: Role;
  displayName: string | null;
  subscriptionStatus: SubscriptionStatus;
};

export type RegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
};

export type CourseLevel = "Débutant" | "Intermédiaire" | "Avancé";

export type CourseSummary = {
  id: number;
  title: string;
  description: string | null;
  level: CourseLevel;
  published: boolean;
  instructorId: number;
  instructorEmail: string;
  primaryLessonType: "VIDEO" | "PDF" | null;
  totalDurationMinutes: number | null;
};

export type LessonPreview = {
  id: number;
  title: string;
  description: string | null;
  lessonType: "VIDEO" | "PDF";
  position: number;
  durationMinutes: number | null;
};

export type Lesson = LessonPreview & {
  contentUrl: string;
};

export type CourseDetail = Omit<CourseSummary, never> & {
  lessons: LessonPreview[];
};

export type InstructorCourseDetail = Omit<CourseSummary, never> & {
  lessons: Lesson[];
};

export type InstructorSummary = {
  id: number;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  specialty: string | null;
};

export type AvailabilitySlot = {
  id: number;
  instructorId: number;
  instructorEmail: string;
  instructorDisplayName: string | null;
  instructorAvatarUrl: string | null;
  instructorSpecialty: string | null;
  startAt: string;
  durationMinutes: number;
  booked: boolean;
};

export type PrivateSession = {
  id: number;
  instructorId: number;
  instructorEmail: string;
  studentId: number;
  studentEmail: string;
  scheduledAt: string;
  durationMinutes: number;
  status: "REQUESTED" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
};

export type CheckoutResponse = {
  checkoutUrl: string;
  stripeSessionId: string;
  orderId: number;
};

export type BookSlotRequest = {
  availabilitySlotId: number;
};

export type CreateAvailabilityRequest = {
  startAt: string;
  durationMinutes: number;
};

export type CreateCourseRequest = {
  title: string;
  description?: string | null;
  level: CourseLevel;
};

export type UpdateCourseRequest = {
  title?: string;
  description?: string | null;
  level?: CourseLevel;
  published?: boolean;
};

export type UpdateLessonRequest = {
  title?: string;
  description?: string | null;
  contentUrl?: string;
  durationMinutes?: number | null;
  position?: number;
};

export type CreateLessonRequest = {
  title: string;
  description?: string | null;
  lessonType: "VIDEO" | "PDF";
  contentUrl: string;
  durationMinutes?: number | null;
};
