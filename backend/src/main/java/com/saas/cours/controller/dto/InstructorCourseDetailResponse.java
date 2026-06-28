package com.saas.cours.controller.dto;

import com.saas.cours.domain.enums.CourseLevel;

import java.util.List;

public record InstructorCourseDetailResponse(
        Long id,
        String title,
        String description,
        CourseLevel level,
        boolean published,
        Long instructorId,
        String instructorEmail,
        List<LessonResponse> lessons
) {
}
