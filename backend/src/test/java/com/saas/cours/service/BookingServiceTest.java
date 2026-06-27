package com.saas.cours.service;

import com.saas.cours.controller.dto.BookSlotRequest;
import com.saas.cours.domain.AvailabilitySlot;
import com.saas.cours.domain.PrivateSession;
import com.saas.cours.domain.User;
import com.saas.cours.domain.enums.SessionStatus;
import com.saas.cours.exception.SlotNotAvailableException;
import com.saas.cours.repository.AvailabilitySlotRepository;
import com.saas.cours.repository.PrivateSessionRepository;
import com.saas.cours.repository.UserRepository;
import com.saas.cours.security.CurrentUserService;
import com.saas.cours.support.TestUsers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class BookingServiceTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AvailabilitySlotRepository availabilitySlotRepository;

    @Autowired
    private PrivateSessionRepository privateSessionRepository;

    @MockBean
    private CurrentUserService currentUserService;

    private User instructor;
    private User student;
    private User otherStudent;

    @BeforeEach
    void setUp() {
        instructor = userRepository.save(TestUsers.instructor("booking-instructor@test.com"));
        student = userRepository.save(TestUsers.student("booking-student@test.com"));
        otherStudent = userRepository.save(TestUsers.student("booking-student-2@test.com"));
        when(currentUserService.getCurrentUser()).thenReturn(student);
    }

    @Test
    void bookSlotLinksSessionToSlotAndMarksBooked() {
        AvailabilitySlot slot = saveSlot(Instant.parse("2030-08-01T10:00:00Z"), 60);

        var response = bookingService.bookSlot(new BookSlotRequest(slot.getId()));

        assertThat(response.status()).isEqualTo(SessionStatus.REQUESTED);
        AvailabilitySlot updated = availabilitySlotRepository.findById(slot.getId()).orElseThrow();
        assertThat(updated.isBooked()).isTrue();

        PrivateSession session = privateSessionRepository.findById(response.id()).orElseThrow();
        assertThat(session.getAvailabilitySlot().getId()).isEqualTo(slot.getId());
    }

    @Test
    void bookSlotFailsWhenInstructorHasOverlappingSession() {
        Instant start = Instant.parse("2030-08-01T10:00:00Z");
        privateSessionRepository.save(PrivateSession.builder()
                .instructor(instructor)
                .student(otherStudent)
                .scheduledAt(start)
                .durationMinutes(60)
                .status(SessionStatus.CONFIRMED)
                .build());

        AvailabilitySlot overlappingSlot = saveSlot(start.plusSeconds(1800), 60);

        assertThatThrownBy(() -> bookingService.bookSlot(new BookSlotRequest(overlappingSlot.getId())))
                .isInstanceOf(SlotNotAvailableException.class);
    }

    @Test
    void bookSlotFailsWhenSlotAlreadyBooked() {
        AvailabilitySlot slot = saveSlot(Instant.parse("2030-08-02T10:00:00Z"), 60);
        slot.setBooked(true);
        availabilitySlotRepository.save(slot);

        assertThatThrownBy(() -> bookingService.bookSlot(new BookSlotRequest(slot.getId())))
                .isInstanceOf(SlotNotAvailableException.class);
    }

    private AvailabilitySlot saveSlot(Instant startAt, int durationMinutes) {
        return availabilitySlotRepository.save(AvailabilitySlot.builder()
                .instructor(instructor)
                .startAt(startAt)
                .durationMinutes(durationMinutes)
                .booked(false)
                .build());
    }
}
