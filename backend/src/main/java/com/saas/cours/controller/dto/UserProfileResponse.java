package com.saas.cours.controller.dto;

import com.saas.cours.domain.enums.Role;

public record UserProfileResponse(
        String email,
        Role role,
        String displayName
) {
}
