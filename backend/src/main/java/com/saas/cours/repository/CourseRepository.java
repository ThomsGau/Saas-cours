package com.saas.cours.repository;

import com.saas.cours.domain.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("SELECT DISTINCT c FROM Course c LEFT JOIN FETCH c.lessons JOIN FETCH c.instructor WHERE c.published = true ORDER BY c.title ASC")
    List<Course> findByPublishedTrueOrderByTitleAsc();

    Optional<Course> findByIdAndPublishedTrue(Long id);

    @Query("SELECT DISTINCT c FROM Course c LEFT JOIN FETCH c.lessons LEFT JOIN FETCH c.instructor WHERE c.id = :id AND c.published = true")
    Optional<Course> findPublishedWithLessonsById(@Param("id") Long id);

    @Query("SELECT DISTINCT c FROM Course c LEFT JOIN FETCH c.lessons JOIN FETCH c.instructor WHERE c.instructor.id = :instructorId ORDER BY c.createdAt DESC")
    List<Course> findByInstructorIdOrderByCreatedAtDesc(@Param("instructorId") Long instructorId);

    @Query("SELECT DISTINCT c FROM Course c LEFT JOIN FETCH c.lessons LEFT JOIN FETCH c.instructor WHERE c.id = :id AND c.instructor.id = :instructorId")
    Optional<Course> findByIdAndInstructorId(@Param("id") Long id, @Param("instructorId") Long instructorId);
}
