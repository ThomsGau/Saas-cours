package com.saas.cours.controller.dto;

import com.saas.cours.domain.enums.SessionStatus;

import java.time.Instant;

public record PrivateSessionResponse(
        Long id,
        Long instructorId,
        String instructorEmail,
        Long studentId,
        String studentEmail,
        Instant scheduledAt,
        int durationMinutes,
        SessionStatus status
) {
}
