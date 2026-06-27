package com.saas.cours.service;

import com.saas.cours.controller.dto.CreateAvailabilityRequest;
import com.saas.cours.domain.AvailabilitySlot;
import com.saas.cours.domain.User;
import com.saas.cours.exception.SlotNotAvailableException;
import com.saas.cours.repository.AvailabilitySlotRepository;
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
class AvailabilityServiceTest {

    @Autowired
    private AvailabilityService availabilityService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AvailabilitySlotRepository availabilitySlotRepository;

    @MockBean
    private CurrentUserService currentUserService;

    private User instructor;

    @BeforeEach
    void setUp() {
        instructor = userRepository.save(TestUsers.instructor("availability-instructor@test.com"));
        when(currentUserService.getCurrentUser()).thenReturn(instructor);
    }

    @Test
    void createSlotSucceedsWhenNoOverlap() {
        Instant start = Instant.parse("2030-07-01T10:00:00Z");

        var response = availabilityService.createSlot(new CreateAvailabilityRequest(start, 60));

        assertThat(response.startAt()).isEqualTo(start);
        assertThat(response.durationMinutes()).isEqualTo(60);
        assertThat(response.booked()).isFalse();
    }

    @Test
    void createSlotFailsWhenOverlappingExistingSlot() {
        Instant start = Instant.parse("2030-07-01T10:00:00Z");
        availabilitySlotRepository.save(AvailabilitySlot.builder()
                .instructor(instructor)
                .startAt(start)
                .durationMinutes(60)
                .booked(false)
                .build());

        assertThatThrownBy(() -> availabilityService.createSlot(
                new CreateAvailabilityRequest(start.plusSeconds(1800), 60)
        )).isInstanceOf(SlotNotAvailableException.class);
    }
}
