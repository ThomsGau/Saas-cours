package com.saas.cours.service;

import com.saas.cours.domain.AvailabilitySlot;
import com.saas.cours.domain.PrivateSession;
import com.saas.cours.domain.User;
import com.saas.cours.domain.enums.SessionStatus;
import com.saas.cours.exception.SlotNotAvailableException;
import com.saas.cours.repository.AvailabilitySlotRepository;
import com.saas.cours.repository.PrivateSessionRepository;
import com.saas.cours.repository.UserRepository;
import com.saas.cours.support.TestUsers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class SlotLifecycleServiceTest {

    @Autowired
    private SlotLifecycleService slotLifecycleService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AvailabilitySlotRepository availabilitySlotRepository;

    @Autowired
    private PrivateSessionRepository privateSessionRepository;

    private User instructor;
    private User student;
    private AvailabilitySlot slot;
    private PrivateSession session;

    @BeforeEach
    void setUp() {
        instructor = userRepository.save(TestUsers.instructor("lifecycle-instructor@test.com"));
        student = userRepository.save(TestUsers.student("lifecycle-student@test.com"));
        slot = availabilitySlotRepository.save(AvailabilitySlot.builder()
                .instructor(instructor)
                .startAt(Instant.parse("2030-09-01T10:00:00Z"))
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
    void cancelUnpaidSessionReleasesSlot() {
        slotLifecycleService.cancelUnpaidSession(session);

        PrivateSession updatedSession = privateSessionRepository.findById(session.getId()).orElseThrow();
        AvailabilitySlot updatedSlot = availabilitySlotRepository.findById(slot.getId()).orElseThrow();

        assertThat(updatedSession.getStatus()).isEqualTo(SessionStatus.CANCELLED);
        assertThat(updatedSlot.isBooked()).isFalse();
    }

    @Test
    void cancelConfirmedSessionIsRejected() {
        session.setStatus(SessionStatus.CONFIRMED);

        assertThatThrownBy(() -> slotLifecycleService.cancelUnpaidSession(session))
                .isInstanceOf(SlotNotAvailableException.class);
    }
}
