package com.saas.cours.repository;

import com.saas.cours.domain.PrivateSession;
import com.saas.cours.domain.enums.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PrivateSessionRepository extends JpaRepository<PrivateSession, Long> {

    @Query("SELECT ps FROM PrivateSession ps JOIN FETCH ps.instructor JOIN FETCH ps.student WHERE ps.student.id = :studentId ORDER BY ps.scheduledAt DESC")
    List<PrivateSession> findByStudentIdOrderByScheduledAtDesc(@Param("studentId") Long studentId);

    @Query("SELECT ps FROM PrivateSession ps JOIN FETCH ps.instructor JOIN FETCH ps.student WHERE ps.instructor.id = :instructorId ORDER BY ps.scheduledAt DESC")
    List<PrivateSession> findByInstructorIdOrderByScheduledAtDesc(@Param("instructorId") Long instructorId);

    List<PrivateSession> findByInstructorIdAndStatusNot(Long instructorId, SessionStatus status);

    List<PrivateSession> findByStudentIdAndStatusNot(Long studentId, SessionStatus status);

    @Query("SELECT ps FROM PrivateSession ps JOIN FETCH ps.instructor JOIN FETCH ps.student LEFT JOIN FETCH ps.order WHERE ps.id = :id AND ps.student.id = :studentId")
    Optional<PrivateSession> findByIdAndStudentIdWithDetails(@Param("id") Long id, @Param("studentId") Long studentId);
}
