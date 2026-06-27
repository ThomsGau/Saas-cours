package com.saas.cours.service;

import com.saas.cours.domain.AvailabilitySlot;
import com.saas.cours.domain.PrivateSession;
import com.saas.cours.domain.enums.SessionStatus;
import com.saas.cours.exception.SlotNotAvailableException;
import com.saas.cours.repository.AvailabilitySlotRepository;
import com.saas.cours.repository.PrivateSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SlotLifecycleService {

    private final AvailabilitySlotRepository availabilitySlotRepository;
    private final PrivateSessionRepository privateSessionRepository;

    @Transactional
    public void cancelUnpaidSession(PrivateSession session) {
        if (session.getStatus() != SessionStatus.REQUESTED) {
            throw new SlotNotAvailableException("Seules les sessions non payées peuvent être annulées.");
        }
        session.setStatus(SessionStatus.CANCELLED);
        releaseSlot(session);
        privateSessionRepository.save(session);
    }

    void releaseSlot(PrivateSession session) {
        AvailabilitySlot slot = session.getAvailabilitySlot();
        if (slot != null) {
            slot.setBooked(false);
            availabilitySlotRepository.save(slot);
        }
    }
}
