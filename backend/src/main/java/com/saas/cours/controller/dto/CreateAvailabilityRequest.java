package com.saas.cours.controller.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record CreateAvailabilityRequest(
        @NotNull @Future Instant startAt,
        @NotNull @Min(15) @Max(480) Integer durationMinutes
) {
}
