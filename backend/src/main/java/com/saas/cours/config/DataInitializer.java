package com.saas.cours.config;

import com.saas.cours.domain.User;
import com.saas.cours.domain.enums.Role;
import com.saas.cours.repository.UserRepository;
import com.saas.cours.util.DisplayNameFormatter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private static final Map<String, InstructorProfile> PROFILES_BY_EMAIL = Map.ofEntries(
            Map.entry("nathalie.girard@example.com", new InstructorProfile(
                    "Nathalie",
                    "Girard",
                    "Design UX",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
            )),
            Map.entry("isabella.moreno@example.com", new InstructorProfile(
                    "Isabella",
                    "Moreno",
                    "Langues",
                    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop"
            )),
            Map.entry("marc.dupont@example.com", new InstructorProfile(
                    "Marc",
                    "Dupont",
                    "Photographie",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
            )),
            Map.entry("sophie.martin@example.com", new InstructorProfile(
                    "Sophie",
                    "Martin",
                    "Marketing",
                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop"
            )),
            Map.entry("julien.bernard@example.com", new InstructorProfile(
                    "Julien",
                    "Bernard",
                    "SEO",
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"
            )),
            Map.entry("theo.lambert@example.com", new InstructorProfile(
                    "Théo",
                    "Lambert",
                    "Data Science",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop"
            )),
            Map.entry("alexandre.petit@example.com", new InstructorProfile(
                    "Alexandre",
                    "Petit",
                    "Développement Web",
                    "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop"
            )),
            Map.entry("claire.renard@example.com", new InstructorProfile(
                    "Claire",
                    "Renard",
                    "Business",
                    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop"
            )),
            Map.entry("camille.rousseau@example.com", new InstructorProfile(
                    "Camille",
                    "Rousseau",
                    "Design Graphique",
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop"
            ))
    );

    private final UserRepository userRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        userRepository.findByRole(Role.INSTRUCTOR).forEach(this::applyInstructorProfile);
        userRepository.findAll().forEach(this::migrateLegacyDisplayName);
        userRepository.findAll().forEach(this::syncDisplayNameFromNames);
        userRepository.findByDisplayNameIsNull().forEach(this::backfillDisplayName);
    }

    private void backfillDisplayName(User user) {
        user.setDisplayName(DisplayNameFormatter.fromEmail(user.getEmail()));
        userRepository.save(user);
        log.info("Nom affiché initialisé pour {}", user.getEmail());
    }

    private void applyInstructorProfile(User instructor) {
        InstructorProfile profile = PROFILES_BY_EMAIL.get(instructor.getEmail().toLowerCase());
        if (profile == null) {
            return;
        }

        if (instructor.getFirstName() == null || instructor.getFirstName().isBlank()) {
            instructor.setFirstName(profile.firstName());
        }
        if (instructor.getLastName() == null || instructor.getLastName().isBlank()) {
            instructor.setLastName(profile.lastName());
        }
        if (instructor.getSpecialty() == null || instructor.getSpecialty().isBlank()) {
            instructor.setSpecialty(profile.specialty());
        }
        if (instructor.getAvatarUrl() == null || instructor.getAvatarUrl().isBlank()) {
            instructor.setAvatarUrl(profile.avatarUrl());
        }

        instructor.setDisplayName(DisplayNameFormatter.fromFirstAndLastName(
                instructor.getFirstName(),
                instructor.getLastName()
        ));
        userRepository.save(instructor);

        log.info("Profil instructeur initialisé pour {}", instructor.getEmail());
    }

    private void migrateLegacyDisplayName(User user) {
        if (DisplayNameFormatter.hasFirstAndLastName(user)) {
            return;
        }

        String displayName = user.getDisplayName();
        if (displayName == null || displayName.isBlank()) {
            return;
        }

        String[] parts = displayName.trim().split("\\s+", 2);
        if (parts.length != 2) {
            return;
        }

        user.setFirstName(parts[0]);
        user.setLastName(parts[1]);
        user.setDisplayName(DisplayNameFormatter.fromFirstAndLastName(parts[0], parts[1]));
        userRepository.save(user);
        log.info("Nom/prénom migrés depuis displayName pour {}", user.getEmail());
    }

    private void syncDisplayNameFromNames(User user) {
        if (!DisplayNameFormatter.hasFirstAndLastName(user)) {
            return;
        }

        String formatted = DisplayNameFormatter.fromFirstAndLastName(
                user.getFirstName(),
                user.getLastName()
        );
        if (formatted.equals(user.getDisplayName())) {
            return;
        }

        user.setDisplayName(formatted);
        userRepository.save(user);
        log.info("Nom affiché synchronisé pour {}", user.getEmail());
    }

    private record InstructorProfile(
            String firstName,
            String lastName,
            String specialty,
            String avatarUrl
    ) {
    }
}
