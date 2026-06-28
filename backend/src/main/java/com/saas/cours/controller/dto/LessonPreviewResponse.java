package com.saas.cours.controller.dto;

import com.saas.cours.domain.enums.LessonType;

public record LessonPreviewResponse(
        Long id,
        String title,
        String description,
        LessonType lessonType,
        int position,
        Integer durationMinutes
) {
}
