package com.saas.cours.service;

import com.saas.cours.domain.PrivateSession;
import com.saas.cours.domain.enums.SessionStatus;
import com.saas.cours.repository.PrivateSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SessionOverlapChecker {

    private final PrivateSessionRepository privateSessionRepository;

    public boolean hasInstructorOverlap(Long instructorId, LocalDateTime startAt, int durationMinutes) {
        return hasOverlap(
                privateSessionRepository.findByInstructorIdAndStatusNot(instructorId, SessionStatus.CANCELLED),
                startAt,
                durationMinutes
        );
    }

    public boolean hasStudentOverlap(Long studentId, LocalDateTime startAt, int durationMinutes) {
        return hasOverlap(
                privateSessionRepository.findByStudentIdAndStatusNot(studentId, SessionStatus.CANCELLED),
                startAt,
                durationMinutes
        );
    }

    private boolean hasOverlap(List<PrivateSession> sessions, LocalDateTime startAt, int durationMinutes) {
        LocalDateTime endAt = startAt.plusMinutes(durationMinutes);
        return sessions.stream().anyMatch(session -> overlaps(
                startAt,
                endAt,
                session.getScheduledAt(),
                session.getScheduledAt().plusMinutes(session.getDurationMinutes())
        ));
    }

    private boolean overlaps(LocalDateTime startA, LocalDateTime endA, LocalDateTime startB, LocalDateTime endB) {
        return startA.isBefore(endB) && endA.isAfter(startB);
    }
}
