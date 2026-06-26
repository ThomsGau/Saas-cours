package com.saas.cours.controller.dto;

import com.saas.cours.domain.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 100) String firstName,
        @NotBlank @Size(max = 100) String lastName,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 100) String password,
        Role role
) {
    public Role roleOrDefault() {
        return role != null ? role : Role.STUDENT;
    }
}
