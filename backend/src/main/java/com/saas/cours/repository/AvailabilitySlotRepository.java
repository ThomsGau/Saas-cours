package com.saas.cours.repository;

import com.saas.cours.domain.AvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, Long> {

    @Query("SELECT s FROM AvailabilitySlot s JOIN FETCH s.instructor WHERE s.instructor.id = :instructorId AND s.startAt > :after ORDER BY s.startAt ASC")
    List<AvailabilitySlot> findByInstructorIdAndStartAtAfterOrderByStartAtAsc(
            @Param("instructorId") Long instructorId,
            @Param("after") LocalDateTime after
    );

    @Query("SELECT s FROM AvailabilitySlot s JOIN FETCH s.instructor WHERE s.instructor.id = :instructorId AND s.booked = false AND s.startAt > :after ORDER BY s.startAt ASC")
    List<AvailabilitySlot> findByInstructorIdAndBookedFalseAndStartAtAfterOrderByStartAtAsc(
            @Param("instructorId") Long instructorId,
            @Param("after") LocalDateTime after
    );

    @Query("SELECT s FROM AvailabilitySlot s JOIN FETCH s.instructor WHERE s.id = :id AND s.instructor.id = :instructorId")
    Optional<AvailabilitySlot> findByIdAndInstructorId(@Param("id") Long id, @Param("instructorId") Long instructorId);

    @Query("SELECT s FROM AvailabilitySlot s JOIN FETCH s.instructor WHERE s.id = :id")
    Optional<AvailabilitySlot> findByIdWithInstructor(@Param("id") Long id);
}
