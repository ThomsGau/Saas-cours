package com.saas.cours.controller.dto;

import com.saas.cours.domain.enums.CourseLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateCourseRequest(
        @NotBlank @Size(max = 255) String title,
        String description,
        @NotNull CourseLevel level
) {
}
