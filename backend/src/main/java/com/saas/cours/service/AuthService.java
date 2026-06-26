package com.saas.cours.service;

import com.saas.cours.config.JwtProperties;
import com.saas.cours.controller.dto.AuthResponse;
import com.saas.cours.controller.dto.LoginRequest;
import com.saas.cours.controller.dto.RegisterRequest;
import com.saas.cours.domain.User;
import com.saas.cours.domain.enums.Role;
import com.saas.cours.domain.enums.SubscriptionStatus;
import com.saas.cours.exception.EmailAlreadyExistsException;
import com.saas.cours.exception.InvalidRoleException;
import com.saas.cours.repository.UserRepository;
import com.saas.cours.security.JwtService;
import com.saas.cours.security.UserPrincipal;
import com.saas.cours.util.DisplayNameFormatter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final AuthenticationManager authenticationManager;
    private final UserService userService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException(email);
        }

        Role role = request.roleOrDefault();
        if (role == Role.ADMIN) {
            throw new InvalidRoleException("Le rôle ADMIN ne peut pas être choisi à l'inscription.");
        }

        String firstName = request.firstName().trim();
        String lastName = request.lastName().trim();

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .role(role)
                .firstName(firstName)
                .lastName(lastName)
                .displayName(formatDisplayName(firstName, lastName))
                .subscriptionStatus(SubscriptionStatus.NONE)
                .build();

        userRepository.save(user);

        UserPrincipal principal = new UserPrincipal(user);
        return buildAuthResponse(principal);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email().toLowerCase(),
                        request.password()
                )
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userService.ensureDisplayName(
                userRepository.findById(principal.getId()).orElseThrow()
        );
        return buildAuthResponse(new UserPrincipal(user));
    }

    private AuthResponse buildAuthResponse(UserPrincipal principal) {
        String token = jwtService.generateToken(principal);
        return new AuthResponse(
                token,
                "Bearer",
                jwtProperties.getExpirationMs(),
                principal.getEmail(),
                principal.getRole(),
                principal.getDisplayName()
        );
    }

    private static String formatDisplayName(String firstName, String lastName) {
        return DisplayNameFormatter.fromFirstAndLastName(firstName, lastName);
    }
}
