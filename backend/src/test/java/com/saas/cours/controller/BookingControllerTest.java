package com.saas.cours.controller;

import com.saas.cours.domain.AvailabilitySlot;
import com.saas.cours.domain.PrivateSession;
import com.saas.cours.domain.User;
import com.saas.cours.domain.enums.SessionStatus;
import com.saas.cours.repository.AvailabilitySlotRepository;
import com.saas.cours.repository.PrivateSessionRepository;
import com.saas.cours.repository.UserRepository;
import com.saas.cours.security.UserPrincipal;
import com.saas.cours.support.TestUsers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Transactional
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AvailabilitySlotRepository availabilitySlotRepository;

    @Autowired
    private PrivateSessionRepository privateSessionRepository;

    private User instructor;
    private User student;
    private PrivateSession session;
    private AvailabilitySlot slot;

    @BeforeEach
    void setUp() {
        instructor = userRepository.save(TestUsers.instructor("controller-instructor@test.com"));
        student = userRepository.save(TestUsers.student("controller-student@test.com"));
        slot = availabilitySlotRepository.save(AvailabilitySlot.builder()
                .instructor(instructor)
                .startAt(Instant.parse("2030-11-01T10:00:00Z"))
                .durationMinutes(60)
                .booked(true)
                .build());
        session = privateSessionRepository.save(PrivateSession.builder()
                .instructor(instructor)
                .student(student)
                .availabilitySlot(slot)
                .scheduledAt(slot.getStartAt())
                .durationMinutes(60)
                .status(SessionStatus.REQUESTED)
                .build());
    }

    @Test
    void studentCanCancelRequestedSession() throws Exception {
        authenticate(student);

        mockMvc.perform(post("/api/bookings/{sessionId}/cancel", session.getId()))
                .andExpect(status().isNoContent());

        PrivateSession updated = privateSessionRepository.findById(session.getId()).orElseThrow();
        AvailabilitySlot updatedSlot = availabilitySlotRepository.findById(slot.getId()).orElseThrow();

        assertThat(updated.getStatus()).isEqualTo(SessionStatus.CANCELLED);
        assertThat(updatedSlot.isBooked()).isFalse();
    }

    @Test
    void instructorCanCancelRequestedSession() throws Exception {
        authenticate(instructor);

        mockMvc.perform(post("/api/bookings/{sessionId}/cancel", session.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void cancelConfirmedSessionReturnsConflict() throws Exception {
        session.setStatus(SessionStatus.CONFIRMED);
        privateSessionRepository.save(session);
        authenticate(student);

        mockMvc.perform(post("/api/bookings/{sessionId}/cancel", session.getId()))
                .andExpect(status().isConflict());
    }

    private void authenticate(User user) {
        UserPrincipal principal = new UserPrincipal(user);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );
    }
}
