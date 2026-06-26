package com.saas.cours.service;

import com.saas.cours.controller.dto.AvailabilitySlotResponse;
import com.saas.cours.controller.dto.CreateAvailabilityRequest;
import com.saas.cours.controller.dto.InstructorSummaryResponse;
import com.saas.cours.domain.AvailabilitySlot;
import com.saas.cours.domain.User;
import com.saas.cours.domain.enums.Role;
import com.saas.cours.exception.ForbiddenActionException;
import com.saas.cours.exception.ResourceNotFoundException;
import com.saas.cours.exception.SlotNotAvailableException;
import com.saas.cours.repository.AvailabilitySlotRepository;
import com.saas.cours.repository.UserRepository;
import com.saas.cours.security.CurrentUserService;
import com.saas.cours.util.DisplayNameFormatter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final AvailabilitySlotRepository availabilitySlotRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final SessionOverlapChecker overlapChecker;

    @Transactional(readOnly = true)
    public List<InstructorSummaryResponse> listInstructors() {
        return userRepository.findByRole(Role.INSTRUCTOR).stream()
                .map(this::toInstructorSummary)
                .toList();
    }

    @Transactional
    public AvailabilitySlotResponse createSlot(CreateAvailabilityRequest request) {
        User instructor = currentUserService.getCurrentUser();
        requireInstructor(instructor);

        if (overlapChecker.hasInstructorOverlap(
                instructor.getId(),
                request.startAt(),
                request.durationMinutes()
        )) {
            throw new SlotNotAvailableException("Ce créneau chevauche une session existante.");
        }

        AvailabilitySlot slot = AvailabilitySlot.builder()
                .instructor(instructor)
                .startAt(request.startAt())
                .durationMinutes(request.durationMinutes())
                .booked(false)
                .build();

        return toResponse(availabilitySlotRepository.save(slot));
    }

    @Transactional(readOnly = true)
    public List<AvailabilitySlotResponse> listMySlots() {
        User instructor = currentUserService.getCurrentUser();
        requireInstructor(instructor);
        return availabilitySlotRepository
                .findByInstructorIdAndStartAtAfterOrderByStartAtAsc(instructor.getId(), LocalDateTime.now())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AvailabilitySlotResponse> listAvailableSlotsForInstructor(Long instructorId) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructeur introuvable."));
        if (instructor.getRole() != Role.INSTRUCTOR) {
            throw new ResourceNotFoundException("Instructeur introuvable.");
        }

        return availabilitySlotRepository
                .findByInstructorIdAndBookedFalseAndStartAtAfterOrderByStartAtAsc(
                        instructorId,
                        LocalDateTime.now()
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void deleteSlot(Long slotId) {
        User instructor = currentUserService.getCurrentUser();
        requireInstructor(instructor);

        AvailabilitySlot slot = availabilitySlotRepository.findByIdAndInstructorId(slotId, instructor.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Créneau introuvable."));

        if (slot.isBooked()) {
            throw new SlotNotAvailableException("Impossible de supprimer un créneau déjà réservé.");
        }

        availabilitySlotRepository.delete(slot);
    }

    private void requireInstructor(User user) {
        if (user.getRole() != Role.INSTRUCTOR) {
            throw new ForbiddenActionException("Seuls les instructeurs peuvent gérer des disponibilités.");
        }
    }

    private InstructorSummaryResponse toInstructorSummary(User user) {
        return new InstructorSummaryResponse(
                user.getId(),
                user.getEmail(),
                DisplayNameFormatter.resolveDisplayName(user),
                user.getAvatarUrl(),
                user.getSpecialty()
        );
    }

    private AvailabilitySlotResponse toResponse(AvailabilitySlot slot) {
        User instructor = slot.getInstructor();
        return new AvailabilitySlotResponse(
                slot.getId(),
                instructor.getId(),
                instructor.getEmail(),
                DisplayNameFormatter.resolveDisplayName(instructor),
                instructor.getAvatarUrl(),
                instructor.getSpecialty(),
                slot.getStartAt(),
                slot.getDurationMinutes(),
                slot.isBooked()
        );
    }
}
