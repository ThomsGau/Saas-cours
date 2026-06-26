package com.saas.cours.controller.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record CreateAvailabilityRequest(
        @NotNull @Future LocalDateTime startAt,
        @NotNull @Min(15) Integer durationMinutes
) {
}
