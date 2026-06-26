package com.saas.cours.controller.dto;

import com.saas.cours.domain.enums.Role;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        String email,
        Role role,
        String displayName
) {
}
