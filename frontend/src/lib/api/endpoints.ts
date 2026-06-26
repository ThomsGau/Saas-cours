export const apiEndpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
  },
  users: {
    me: "/users/me",
  },
  catalog: {
    courses: "/catalog/courses",
    course: (courseId: number | string) => `/catalog/courses/${courseId}`,
    lesson: (courseId: number | string, lessonId: number | string) =>
      `/catalog/courses/${courseId}/lessons/${lessonId}`,
  },
  instructors: {
    list: "/instructors",
    availabilities: (instructorId: number | string) =>
      `/instructors/${instructorId}/availabilities`,
    myAvailabilities: "/me/instructor/availabilities",
    deleteMyAvailability: (slotId: number | string) =>
      `/me/instructor/availabilities/${slotId}`,
  },
  bookings: {
    create: "/bookings",
    mine: "/bookings/me",
    instructorMine: "/bookings/instructor/me",
  },
  payments: {
    subscriptionCheckout: "/payments/subscription/checkout",
    privateSessionCheckout: (sessionId: number | string) =>
      `/payments/private-sessions/${sessionId}/checkout`,
  },
} as const;
