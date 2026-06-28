package com.saas.cours.controller.dto;

import com.saas.cours.domain.enums.Role;
import com.saas.cours.domain.enums.SubscriptionStatus;

public record UserProfileResponse(
        String email,
        Role role,
        String displayName,
        SubscriptionStatus subscriptionStatus
) {
}
