package com.saas.cours.controller.dto;

public record InstructorSummaryResponse(
        Long id,
        String email,
        String displayName,
        String avatarUrl,
        String specialty
) {
}
