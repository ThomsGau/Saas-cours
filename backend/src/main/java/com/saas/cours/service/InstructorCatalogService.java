package com.saas.cours.service;

import com.saas.cours.controller.dto.CourseDetailResponse;
import com.saas.cours.controller.dto.CourseSummaryResponse;
import com.saas.cours.controller.dto.CreateCourseRequest;
import com.saas.cours.controller.dto.CreateLessonRequest;
import com.saas.cours.controller.dto.LessonResponse;
import com.saas.cours.domain.Course;
import com.saas.cours.domain.Lesson;
import com.saas.cours.domain.User;
import com.saas.cours.domain.enums.LessonType;
import com.saas.cours.domain.enums.Role;
import com.saas.cours.exception.ForbiddenActionException;
import com.saas.cours.exception.ResourceNotFoundException;
import com.saas.cours.repository.CourseRepository;
import com.saas.cours.repository.LessonRepository;
import com.saas.cours.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InstructorCatalogService {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public CourseDetailResponse createCourse(CreateCourseRequest request) {
        User instructor = currentUserService.getCurrentUser();
        requireInstructor(instructor);

        Course course = Course.builder()
                .title(request.title())
                .description(request.description())
                .published(true)
                .instructor(instructor)
                .build();

        return toDetail(courseRepository.save(course));
    }

    @Transactional(readOnly = true)
    public List<CourseSummaryResponse> listMyCourses() {
        User instructor = currentUserService.getCurrentUser();
        requireInstructor(instructor);
        return courseRepository.findByInstructorIdOrderByCreatedAtDesc(instructor.getId()).stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseDetailResponse getMyCourse(Long courseId) {
        User instructor = currentUserService.getCurrentUser();
        requireInstructor(instructor);
        Course course = requireOwnedCourse(courseId, instructor.getId());
        return toDetail(course);
    }

    @Transactional
    public LessonResponse addLesson(Long courseId, CreateLessonRequest request) {
        User instructor = currentUserService.getCurrentUser();
        requireInstructor(instructor);
        Course course = requireOwnedCourse(courseId, instructor.getId());

        int nextPosition = lessonRepository.findByCourseIdOrderByPositionAsc(courseId).stream()
                .mapToInt(Lesson::getPosition)
                .max()
                .orElse(0) + 1;

        Lesson lesson = Lesson.builder()
                .title(request.title())
                .description(request.description())
                .lessonType(request.lessonType())
                .contentUrl(request.contentUrl())
                .durationMinutes(request.durationMinutes())
                .position(nextPosition)
                .build();
        course.addLesson(lesson);

        return toLessonResponse(lessonRepository.save(lesson));
    }

    @Transactional
    public void deleteLesson(Long courseId, Long lessonId) {
        User instructor = currentUserService.getCurrentUser();
        requireInstructor(instructor);
        requireOwnedCourse(courseId, instructor.getId());

        Lesson lesson = lessonRepository.findByIdAndCourseId(lessonId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Leçon introuvable."));
        lessonRepository.delete(lesson);
    }

    @Transactional
    public void deleteCourse(Long courseId) {
        User instructor = currentUserService.getCurrentUser();
        requireInstructor(instructor);
        Course course = requireOwnedCourse(courseId, instructor.getId());
        courseRepository.delete(course);
    }

    private Course requireOwnedCourse(Long courseId, Long instructorId) {
        return courseRepository.findByIdAndInstructorId(courseId, instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable."));
    }

    private void requireInstructor(User user) {
        if (user.getRole() != Role.INSTRUCTOR) {
            throw new ForbiddenActionException("Seuls les instructeurs peuvent gérer des cours.");
        }
    }

    private CourseSummaryResponse toSummary(Course course) {
        return new CourseSummaryResponse(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getInstructor().getId(),
                course.getInstructor().getEmail(),
                resolvePrimaryLessonType(course)
        );
    }

    private LessonType resolvePrimaryLessonType(Course course) {
        return course.getLessons().stream()
                .min(Comparator.comparing(Lesson::getPosition))
                .map(Lesson::getLessonType)
                .orElse(null);
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
