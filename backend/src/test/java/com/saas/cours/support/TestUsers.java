package com.saas.cours.support;

import com.saas.cours.domain.User;
import com.saas.cours.domain.enums.Role;
import com.saas.cours.domain.enums.SubscriptionStatus;

public final class TestUsers {

    public static User instructor(String email) {
        return User.builder()
                .email(email)
                .password("password")
                .role(Role.INSTRUCTOR)
                .subscriptionStatus(SubscriptionStatus.NONE)
                .build();
    }

    public static User student(String email) {
        return User.builder()
                .email(email)
                .password("password")
                .role(Role.STUDENT)
                .subscriptionStatus(SubscriptionStatus.NONE)
                .build();
    }
}
