package com.saas.cours.controller.dto;

import java.util.List;

public record CourseDetailResponse(
        Long id,
        String title,
        String description,
        Long instructorId,
        String instructorEmail,
        List<LessonResponse> lessons
) {
}
