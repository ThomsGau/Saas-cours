package com.saas.cours.controller.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record UpdateLessonRequest(
        @Size(max = 255) String title,
        String description,
        @Size(max = 2048) String contentUrl,
        @Min(1) Integer durationMinutes,
        @Min(1) Integer position
) {
}
