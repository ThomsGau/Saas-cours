package com.saas.cours.security;

import com.saas.cours.domain.User;
import com.saas.cours.exception.ResourceNotFoundException;
import com.saas.cours.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        UserPrincipal principal = getCurrentPrincipal();
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable."));
    }

    public UserPrincipal getCurrentPrincipal() {
        return (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
