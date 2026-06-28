package com.saas.cours.util;

import com.saas.cours.domain.Course;
import com.saas.cours.domain.Lesson;
import com.saas.cours.domain.enums.LessonType;

public final class CourseDurationUtils {

    private CourseDurationUtils() {
    }

    public static int sumVideoDurationMinutes(Course course) {
        return course.getLessons().stream()
                .filter(lesson -> lesson.getLessonType() == LessonType.VIDEO)
                .map(Lesson::getDurationMinutes)
                .filter(duration -> duration != null && duration > 0)
                .mapToInt(Integer::intValue)
                .sum();
    }
}
