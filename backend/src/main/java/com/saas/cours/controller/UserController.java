package com.saas.cours.controller;

import com.saas.cours.controller.dto.UserProfileResponse;
import com.saas.cours.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserProfileResponse getCurrentUser() {
        return userService.getCurrentUserProfile();
    }
}
