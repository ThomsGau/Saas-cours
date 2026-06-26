package com.saas.cours.repository;

import com.saas.cours.domain.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByCourseIdOrderByPositionAsc(Long courseId);

    Optional<Lesson> findByIdAndCourseId(Long id, Long courseId);
}
