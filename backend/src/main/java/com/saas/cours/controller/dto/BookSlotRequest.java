package com.saas.cours.controller.dto;

import jakarta.validation.constraints.NotNull;

public record BookSlotRequest(
        @NotNull Long availabilitySlotId
) {
}
