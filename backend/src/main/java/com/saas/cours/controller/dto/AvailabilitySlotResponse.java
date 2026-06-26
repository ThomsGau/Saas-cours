package com.saas.cours.controller.dto;

import java.time.LocalDateTime;

public record AvailabilitySlotResponse(
        Long id,
        Long instructorId,
        String instructorEmail,
        String instructorDisplayName,
        String instructorAvatarUrl,
        String instructorSpecialty,
        LocalDateTime startAt,
        int durationMinutes,
        boolean booked
) {
}
