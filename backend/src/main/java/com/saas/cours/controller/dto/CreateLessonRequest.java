package com.saas.cours.controller.dto;

import com.saas.cours.domain.enums.LessonType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateLessonRequest(
        @NotBlank @Size(max = 255) String title,
        String description,
        @NotNull LessonType lessonType,
        @NotBlank @Size(max = 2048) String contentUrl,
        @Min(1) Integer durationMinutes
) {
}
