package com.saas.cours.controller.dto;

import com.saas.cours.domain.enums.LessonType;

public record LessonResponse(
        Long id,
        String title,
        String description,
        LessonType lessonType,
        String contentUrl,
        int position,
        Integer durationMinutes
) {
}
