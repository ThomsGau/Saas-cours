package com.saas.cours.service;

import com.saas.cours.controller.dto.InstructorCourseDetailResponse;
import com.saas.cours.controller.dto.CourseSummaryResponse;
import com.saas.cours.controller.dto.CreateCourseRequest;
import com.saas.cours.controller.dto.CreateLessonRequest;
import com.saas.cours.controller.dto.LessonResponse;
import com.saas.cours.controller.dto.UpdateCourseRequest;
import com.saas.cours.controller.dto.UpdateLessonRequest;
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
import com.saas.cours.util.LessonContentUrlValidator;
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
    private final CourseMapper courseMapper;

    @Transactional
    public InstructorCourseDetailResponse createCourse(CreateCourseRequest request) {
        User instructor = currentUserService.getCurrentUser();
        requireInstructor(instructor);

        Course course = Course.builder()
                .title(request.title())
                .description(request.description())
                .level(request.level())
                .published(false)
                .instructor(instructor)
                .build();

        return courseMapper.toInstructorDetail(courseRepository.save(course));
    }

    @Transactional(readOnly = true)
    public List<CourseSummaryResponse> listMyCourses() {
        User instructor = currentUserService.getCurrentUser();
        requireInstructor(instructor);
        return courseRepository.findByInstructorIdOrderByCreatedAtDesc(instructor.getId()).stream()
                .map(courseMapper::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public InstructorCourseDetailResponse getMyCourse(Long courseId) {
        User instructor = currentUserService.getCurrentUser();
        requireInstructor(instructor);
        Course course = requireOwnedCourse(courseId, instructor.getId());
        return courseMapper.toInstructorDetail(course);
    }

    @Transactional
    public InstructorCourseDetailResponse updateCourse(Long courseId, UpdateCourseRequest request) {
        User instructor = currentUserService.getCurrentUser();
        requireInstructor(instructor);
        Course course = requireOwnedCourse(courseId, instructor.getId());

        if (request.title() != null) {
            if (request.title().isBlank()) {
                throw new IllegalArgumentException("Le titre ne peut pas être vide.");
            }
            course.setTitle(request.title());
        }
        if (request.description() != null) {
            course.setDescription(request.description());
        }
        if (request.level() != null) {
            course.setLevel(request.level());
        }
        if (request.published() != null) {
            if (request.published() && course.getLessons().isEmpty()) {
                throw new IllegalArgumentException("Ajoutez au moins une leçon avant de publier.");
            }
            course.setPublished(request.published());
        }

        return courseMapper.toInstructorDetail(courseRepository.save(course));
    }

    @Transactional
    public LessonResponse addLesson(Long courseId, CreateLessonRequest request) {
        User instructor = currentUserService.getCurrentUser();
        requireInstructor(instructor);
        Course course = requireOwnedCourse(courseId, instructor.getId());

        List<Lesson> existingLessons = lessonRepository.findByCourseIdOrderByPositionAsc(courseId);
        enforceConsistentLessonType(existingLessons, request.lessonType());

        int nextPosition = existingLessons.stream()
                .mapToInt(Lesson::getPosition)
                .max()
                .orElse(0) + 1;

        Lesson lesson = Lesson.builder()
                .title(request.title())
                .description(request.description())
                .lessonType(request.lessonType())
                .contentUrl(request.contentUrl())
                .durationMinutes(request.lessonType() == LessonType.VIDEO
                        ? request.durationMinutes()
                        : null)
                .position(nextPosition)
                .build();
        course.addLesson(lesson);

        lessonRepository.save(lesson);
        courseRepository.save(course);

        return courseMapper.toLessonResponse(lesson);
    }

    @Transactional
    public LessonResponse updateLesson(Long courseId, Long lessonId, UpdateLessonRequest request) {
        User instructor = currentUserService.getCurrentUser();
        requireInstructor(instructor);
        requireOwnedCourse(courseId, instructor.getId());

        Lesson lesson = lessonRepository.findByIdAndCourseId(lessonId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Leçon introuvable."));

        if (request.title() != null) {
            if (request.title().isBlank()) {
                throw new IllegalArgumentException("Le titre ne peut pas être vide.");
            }
            lesson.setTitle(request.title());
        }
        if (request.description() != null) {
            lesson.setDescription(request.description());
        }
        if (request.contentUrl() != null) {
            validateContentUrl(lesson.getLessonType(), request.contentUrl());
            lesson.setContentUrl(request.contentUrl());
        }
        if (request.durationMinutes() != null) {
            if (lesson.getLessonType() != LessonType.VIDEO) {
                throw new IllegalArgumentException("La durée ne s'applique qu'aux leçons vidéo.");
            }
            lesson.setDurationMinutes(request.durationMinutes());
        }
        if (request.position() != null) {
            updateLessonPosition(courseId, lesson, request.position());
        }

        return courseMapper.toLessonResponse(lessonRepository.save(lesson));
    }

    @Transactional
    public void deleteLesson(Long courseId, Long lessonId) {
        User instructor = currentUserService.getCurrentUser();
        requireInstructor(instructor);
        Course course = requireOwnedCourse(courseId, instructor.getId());

        Lesson lesson = lessonRepository.findByIdAndCourseId(lessonId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Leçon introuvable."));
        int deletedPosition = lesson.getPosition();
        course.removeLesson(lesson);
        compactLessonPositionsAfterDelete(course, deletedPosition);
        if (course.getLessons().isEmpty()) {
            course.setPublished(false);
        }
        courseRepository.save(course);
    }

    @Transactional
    public void deleteCourse(Long courseId) {
        User instructor = currentUserService.getCurrentUser();
        requireInstructor(instructor);
        Course course = requireOwnedCourse(courseId, instructor.getId());
        courseRepository.delete(course);
    }

    private void enforceConsistentLessonType(List<Lesson> existingLessons, LessonType requestedType) {
        if (existingLessons.isEmpty()) {
            return;
        }

        Lesson primaryLesson = existingLessons.stream()
                .min(Comparator.comparing(Lesson::getPosition))
                .orElseThrow();

        if (primaryLesson.getLessonType() != requestedType) {
            throw new IllegalArgumentException(
                    "Toutes les leçons d'un cours doivent être du même type (PDF ou vidéo)."
            );
        }
    }

    private void validateContentUrl(LessonType lessonType, String contentUrl) {
        if (lessonType == LessonType.VIDEO && !LessonContentUrlValidator.isValidYouTubeUrl(contentUrl)) {
            throw new IllegalArgumentException("Lien YouTube invalide.");
        }
        if (lessonType == LessonType.PDF && !LessonContentUrlValidator.isValidPdfUrl(contentUrl)) {
            throw new IllegalArgumentException("Lien PDF invalide (https://…/fichier.pdf requis).");
        }
    }

    private void compactLessonPositionsAfterDelete(Course course, int deletedPosition) {
        for (Lesson current : course.getLessons()) {
            if (current.getPosition() > deletedPosition) {
                current.setPosition(current.getPosition() - 1);
            }
        }
    }

    private void updateLessonPosition(Long courseId, Lesson lesson, int newPosition) {
        List<Lesson> lessons = lessonRepository.findByCourseIdOrderByPositionAsc(courseId);
        if (newPosition < 1 || newPosition > lessons.size()) {
            throw new IllegalArgumentException("Position invalide.");
        }

        int oldPosition = lesson.getPosition();
        if (oldPosition == newPosition) {
            return;
        }

        for (Lesson current : lessons) {
            if (current.getId().equals(lesson.getId())) {
                continue;
            }
            if (oldPosition < newPosition) {
                if (current.getPosition() > oldPosition && current.getPosition() <= newPosition) {
                    current.setPosition(current.getPosition() - 1);
                }
            } else if (current.getPosition() >= newPosition && current.getPosition() < oldPosition) {
                current.setPosition(current.getPosition() + 1);
            }
        }
        lesson.setPosition(newPosition);
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
}
