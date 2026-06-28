package com.saas.cours.controller.dto;

import com.saas.cours.domain.enums.CourseLevel;
import com.saas.cours.domain.enums.LessonType;

public record CourseSummaryResponse(
        Long id,
        String title,
        String description,
        CourseLevel level,
        boolean published,
        Long instructorId,
        String instructorEmail,
        LessonType primaryLessonType,
        Integer totalDurationMinutes
) {
}
