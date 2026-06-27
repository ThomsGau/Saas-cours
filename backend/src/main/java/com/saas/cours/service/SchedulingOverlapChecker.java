package com.saas.cours.service;

import com.saas.cours.domain.AvailabilitySlot;
import com.saas.cours.domain.PrivateSession;
import com.saas.cours.domain.enums.SessionStatus;
import com.saas.cours.repository.AvailabilitySlotRepository;
import com.saas.cours.repository.PrivateSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SchedulingOverlapChecker {

    private final PrivateSessionRepository privateSessionRepository;
    private final AvailabilitySlotRepository availabilitySlotRepository;

    public boolean hasInstructorSchedulingConflict(
            Long instructorId,
            Instant startAt,
            int durationMinutes,
            Long excludeSlotId
    ) {
        Instant endAt = startAt.plusSeconds(durationMinutes * 60L);
        if (hasSessionOverlap(
                privateSessionRepository.findByInstructorIdAndStatusNot(instructorId, SessionStatus.CANCELLED),
                startAt,
                endAt
        )) {
            return true;
        }
        return hasSlotOverlap(instructorId, startAt, endAt, excludeSlotId);
    }

    public boolean hasStudentSchedulingConflict(Long studentId, Instant startAt, int durationMinutes) {
        Instant endAt = startAt.plusSeconds(durationMinutes * 60L);
        return hasSessionOverlap(
                privateSessionRepository.findByStudentIdAndStatusNot(studentId, SessionStatus.CANCELLED),
                startAt,
                endAt
        );
    }

    private boolean hasSlotOverlap(
            Long instructorId,
            Instant startAt,
            Instant endAt,
            Long excludeSlotId
    ) {
        List<AvailabilitySlot> candidates = availabilitySlotRepository
                .findByInstructorIdAndStartAtBefore(instructorId, endAt);
        return candidates.stream()
                .filter(slot -> excludeSlotId == null || !slot.getId().equals(excludeSlotId))
                .anyMatch(slot -> overlaps(
                        startAt,
                        endAt,
                        slot.getStartAt(),
                        slot.getStartAt().plusSeconds(slot.getDurationMinutes() * 60L)
                ));
    }

    private boolean hasSessionOverlap(List<PrivateSession> sessions, Instant startAt, Instant endAt) {
        return sessions.stream().anyMatch(session -> overlaps(
                startAt,
                endAt,
                session.getScheduledAt(),
                session.getScheduledAt().plusSeconds(session.getDurationMinutes() * 60L)
        ));
    }

    private boolean overlaps(Instant startA, Instant endA, Instant startB, Instant endB) {
        return startA.isBefore(endB) && endA.isAfter(startB);
    }
}
