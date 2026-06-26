package com.saas.cours.controller.dto;

public record CourseSummaryResponse(
        Long id,
        String title,
        String description,
        Long instructorId,
        String instructorEmail
) {
}
