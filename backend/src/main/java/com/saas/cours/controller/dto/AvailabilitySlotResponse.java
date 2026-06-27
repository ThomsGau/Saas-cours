package com.saas.cours.controller.dto;

import java.time.Instant;

public record AvailabilitySlotResponse(
        Long id,
        Long instructorId,
        String instructorEmail,
        String instructorDisplayName,
        String instructorAvatarUrl,
        String instructorSpecialty,
        Instant startAt,
        int durationMinutes,
        boolean booked
) {
}
