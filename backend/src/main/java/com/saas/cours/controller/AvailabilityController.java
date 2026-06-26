package com.saas.cours.controller;

import com.saas.cours.controller.dto.AvailabilitySlotResponse;
import com.saas.cours.controller.dto.CreateAvailabilityRequest;
import com.saas.cours.controller.dto.InstructorSummaryResponse;
import com.saas.cours.service.AvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping("/instructors")
    public List<InstructorSummaryResponse> listInstructors() {
        return availabilityService.listInstructors();
    }

    @GetMapping("/instructors/{instructorId}/availabilities")
    public List<AvailabilitySlotResponse> listAvailableSlots(@PathVariable Long instructorId) {
        return availabilityService.listAvailableSlotsForInstructor(instructorId);
    }

    @PostMapping("/me/instructor/availabilities")
    @ResponseStatus(HttpStatus.CREATED)
    public AvailabilitySlotResponse createSlot(@Valid @RequestBody CreateAvailabilityRequest request) {
        return availabilityService.createSlot(request);
    }

    @GetMapping("/me/instructor/availabilities")
    public List<AvailabilitySlotResponse> listMySlots() {
        return availabilityService.listMySlots();
    }

    @DeleteMapping("/me/instructor/availabilities/{slotId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSlot(@PathVariable Long slotId) {
        availabilityService.deleteSlot(slotId);
    }
}
