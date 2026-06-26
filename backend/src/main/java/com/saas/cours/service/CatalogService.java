package com.saas.cours.service;

import com.saas.cours.controller.dto.CourseDetailResponse;
import com.saas.cours.controller.dto.CourseSummaryResponse;
import com.saas.cours.controller.dto.LessonResponse;
import com.saas.cours.domain.Course;
import com.saas.cours.domain.Lesson;
import com.saas.cours.domain.User;
import com.saas.cours.domain.enums.SubscriptionStatus;
import com.saas.cours.exception.ResourceNotFoundException;
import com.saas.cours.exception.SubscriptionRequiredException;
import com.saas.cours.repository.CourseRepository;
import com.saas.cours.repository.LessonRepository;
import com.saas.cours.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public List<CourseSummaryResponse> listPublishedCourses() {
        requireActiveSubscription();
        return courseRepository.findByPublishedTrueOrderByTitleAsc().stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseDetailResponse getPublishedCourse(Long courseId) {
        requireActiveSubscription();
        Course course = courseRepository.findPublishedWithLessonsById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable."));
        return toDetail(course);
    }

    @Transactional(readOnly = true)
    public LessonResponse getLesson(Long courseId, Long lessonId) {
        requireActiveSubscription();
        courseRepository.findByIdAndPublishedTrue(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable."));
        Lesson lesson = lessonRepository.findByIdAndCourseId(lessonId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Leçon introuvable."));
        return toLessonResponse(lesson);
    }

    private void requireActiveSubscription() {
        User user = currentUserService.getCurrentUser();
        if (user.getSubscriptionStatus() != SubscriptionStatus.ACTIVE) {
            throw new SubscriptionRequiredException();
        }
    }

    private CourseSummaryResponse toSummary(Course course) {
        return new CourseSummaryResponse(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getInstructor().getId(),
                course.getInstructor().getEmail()
        );
    }

    private CourseDetailResponse toDetail(Course course) {
        List<LessonResponse> lessons = course.getLessons().stream()
                .map(this::toLessonResponse)
                .toList();
        return new CourseDetailResponse(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getInstructor().getId(),
                course.getInstructor().getEmail(),
                lessons
        );
    }

    private LessonResponse toLessonResponse(Lesson lesson) {
        return new LessonResponse(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getDescription(),
                lesson.getLessonType(),
                lesson.getContentUrl(),
                lesson.getPosition(),
                lesson.getDurationMinutes()
        );
    }
}
