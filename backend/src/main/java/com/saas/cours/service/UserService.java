package com.saas.cours.service;

import com.saas.cours.controller.dto.UserProfileResponse;
import com.saas.cours.domain.User;
import com.saas.cours.repository.UserRepository;
import com.saas.cours.security.CurrentUserService;
import com.saas.cours.util.DisplayNameFormatter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;

    @Transactional
    public UserProfileResponse getCurrentUserProfile() {
        User user = ensureDisplayName(currentUserService.getCurrentUser());
        return toProfile(user);
    }

    @Transactional
    public User ensureDisplayName(User user) {
        if (DisplayNameFormatter.hasFirstAndLastName(user)) {
            String formatted = DisplayNameFormatter.fromFirstAndLastName(
                    user.getFirstName(),
                    user.getLastName()
            );
            if (!formatted.equals(user.getDisplayName())) {
                user.setDisplayName(formatted);
                return userRepository.save(user);
            }
            return user;
        }

        if (user.getDisplayName() != null && !user.getDisplayName().isBlank()) {
            return user;
        }

        user.setDisplayName(DisplayNameFormatter.fromEmail(user.getEmail()));
        return userRepository.save(user);
    }

    private UserProfileResponse toProfile(User user) {
        return new UserProfileResponse(
                user.getEmail(),
                user.getRole(),
                DisplayNameFormatter.resolveDisplayName(user)
        );
    }
}
