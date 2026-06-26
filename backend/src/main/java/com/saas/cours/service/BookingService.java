package com.saas.cours.service;

import com.saas.cours.controller.dto.BookSlotRequest;
import com.saas.cours.controller.dto.PrivateSessionResponse;
import com.saas.cours.domain.AvailabilitySlot;
import com.saas.cours.domain.PrivateSession;
import com.saas.cours.domain.User;
import com.saas.cours.domain.enums.Role;
import com.saas.cours.domain.enums.SessionStatus;
import com.saas.cours.exception.ForbiddenActionException;
import com.saas.cours.exception.ResourceNotFoundException;
import com.saas.cours.exception.SlotNotAvailableException;
import com.saas.cours.repository.AvailabilitySlotRepository;
import com.saas.cours.repository.PrivateSessionRepository;
import com.saas.cours.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final AvailabilitySlotRepository availabilitySlotRepository;
    private final PrivateSessionRepository privateSessionRepository;
    private final CurrentUserService currentUserService;
    private final SessionOverlapChecker overlapChecker;

    @Transactional
    public PrivateSessionResponse bookSlot(BookSlotRequest request) {
        User student = currentUserService.getCurrentUser();
        requireStudent(student);

        AvailabilitySlot slot = availabilitySlotRepository.findByIdWithInstructor(request.availabilitySlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Créneau introuvable."));

        if (slot.isBooked()) {
            throw new SlotNotAvailableException("Ce créneau n'est plus disponible.");
        }

        if (slot.getStartAt().isBefore(LocalDateTime.now())) {
            throw new SlotNotAvailableException("Ce créneau est déjà passé.");
        }

        if (slot.getInstructor().getId().equals(student.getId())) {
            throw new ForbiddenActionException("Vous ne pouvez pas réserver votre propre créneau.");
        }

        if (overlapChecker.hasStudentOverlap(student.getId(), slot.getStartAt(), slot.getDurationMinutes())) {
            throw new SlotNotAvailableException("Vous avez déjà une session à ce moment-là.");
        }

        PrivateSession session = PrivateSession.builder()
                .instructor(slot.getInstructor())
                .student(student)
                .scheduledAt(slot.getStartAt())
                .durationMinutes(slot.getDurationMinutes())
                .status(SessionStatus.REQUESTED)
                .build();

        PrivateSession savedSession = privateSessionRepository.save(session);
        slot.setBooked(true);
        availabilitySlotRepository.save(slot);

        return toResponse(savedSession);
    }

    @Transactional(readOnly = true)
    public List<PrivateSessionResponse> listMyBookings() {
        User student = currentUserService.getCurrentUser();
        requireStudent(student);
        return privateSessionRepository.findByStudentIdOrderByScheduledAtDesc(student.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PrivateSessionResponse> listMyInstructorSessions() {
        User instructor = currentUserService.getCurrentUser();
        if (instructor.getRole() != Role.INSTRUCTOR) {
            throw new ForbiddenActionException("Seuls les instructeurs peuvent consulter leurs sessions.");
        }
        return privateSessionRepository.findByInstructorIdOrderByScheduledAtDesc(instructor.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    private void requireStudent(User user) {
        if (user.getRole() != Role.STUDENT) {
            throw new ForbiddenActionException("Seuls les élèves peuvent réserver un créneau.");
        }
    }

    private PrivateSessionResponse toResponse(PrivateSession session) {
        return new PrivateSessionResponse(
                session.getId(),
                session.getInstructor().getId(),
                session.getInstructor().getEmail(),
                session.getStudent().getId(),
                session.getStudent().getEmail(),
                session.getScheduledAt(),
                session.getDurationMinutes(),
                session.getStatus()
        );
    }
}
