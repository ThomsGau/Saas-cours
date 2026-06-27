package com.saas.cours.controller;

import com.saas.cours.controller.dto.BookSlotRequest;
import com.saas.cours.controller.dto.PrivateSessionResponse;
import com.saas.cours.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PrivateSessionResponse bookSlot(@Valid @RequestBody BookSlotRequest request) {
        return bookingService.bookSlot(request);
    }

    @PostMapping("/{sessionId}/cancel")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelSession(@PathVariable Long sessionId) {
        bookingService.cancelSession(sessionId);
    }

    @GetMapping("/me")
    public List<PrivateSessionResponse> listMyBookings() {
        return bookingService.listMyBookings();
    }

    @GetMapping("/instructor/me")
    public List<PrivateSessionResponse> listMyInstructorSessions() {
        return bookingService.listMyInstructorSessions();
    }
}
