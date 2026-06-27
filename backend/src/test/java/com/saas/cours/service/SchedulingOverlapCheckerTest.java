package com.saas.cours.service;

import com.saas.cours.domain.AvailabilitySlot;
import com.saas.cours.domain.PrivateSession;
import com.saas.cours.domain.User;
import com.saas.cours.domain.enums.SessionStatus;
import com.saas.cours.repository.AvailabilitySlotRepository;
import com.saas.cours.repository.PrivateSessionRepository;
import com.saas.cours.repository.UserRepository;
import com.saas.cours.support.TestUsers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(SchedulingOverlapChecker.class)
class SchedulingOverlapCheckerTest {

    @Autowired
    private SchedulingOverlapChecker overlapChecker;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AvailabilitySlotRepository availabilitySlotRepository;

    @Autowired
    private PrivateSessionRepository privateSessionRepository;

    private User instructor;
    private User student;

    @BeforeEach
    void setUp() {
        instructor = userRepository.save(TestUsers.instructor("instructor@test.com"));
        student = userRepository.save(TestUsers.student("student@test.com"));
    }

    @Test
    void adjacentSlotsDoNotConflict() {
        Instant start = Instant.parse("2030-06-01T10:00:00Z");
        availabilitySlotRepository.save(slot(instructor, start, 60));

        boolean conflict = overlapChecker.hasInstructorSchedulingConflict(
                instructor.getId(),
                start.plusSeconds(3600),
                60,
                null
        );

        assertThat(conflict).isFalse();
    }

    @Test
    void overlappingSlotsConflict() {
        Instant start = Instant.parse("2030-06-01T10:00:00Z");
        availabilitySlotRepository.save(slot(instructor, start, 60));

        boolean conflict = overlapChecker.hasInstructorSchedulingConflict(
                instructor.getId(),
                start.plusSeconds(1800),
                60,
                null
        );

        assertThat(conflict).isTrue();
    }

    @Test
    void overlappingSessionsConflict() {
        Instant start = Instant.parse("2030-06-01T10:00:00Z");
        privateSessionRepository.save(session(instructor, student, start, 60, SessionStatus.CONFIRMED));

        boolean conflict = overlapChecker.hasInstructorSchedulingConflict(
                instructor.getId(),
                start.plusSeconds(1800),
                60,
                null
        );

        assertThat(conflict).isTrue();
    }

    @Test
    void cancelledSessionsAreIgnored() {
        Instant start = Instant.parse("2030-06-01T10:00:00Z");
        privateSessionRepository.save(session(instructor, student, start, 60, SessionStatus.CANCELLED));

        boolean conflict = overlapChecker.hasInstructorSchedulingConflict(
                instructor.getId(),
                start,
                60,
                null
        );

        assertThat(conflict).isFalse();
    }

    @Test
    void excludeSlotIdSkipsSelfWhenBooking() {
        Instant start = Instant.parse("2030-06-01T10:00:00Z");
        AvailabilitySlot slot = availabilitySlotRepository.save(slot(instructor, start, 60));

        boolean conflict = overlapChecker.hasInstructorSchedulingConflict(
                instructor.getId(),
                start,
                60,
                slot.getId()
        );

        assertThat(conflict).isFalse();
    }

    private AvailabilitySlot slot(User instructor, Instant startAt, int durationMinutes) {
        return AvailabilitySlot.builder()
                .instructor(instructor)
                .startAt(startAt)
                .durationMinutes(durationMinutes)
                .booked(false)
                .build();
    }

    private PrivateSession session(
            User instructor,
            User student,
            Instant scheduledAt,
            int durationMinutes,
            SessionStatus status
    ) {
        return PrivateSession.builder()
                .instructor(instructor)
                .student(student)
                .scheduledAt(scheduledAt)
                .durationMinutes(durationMinutes)
                .status(status)
                .build();
    }
}
