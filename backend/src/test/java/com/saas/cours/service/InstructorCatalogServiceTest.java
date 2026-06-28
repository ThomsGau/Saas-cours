package com.saas.cours.service;

import com.saas.cours.controller.dto.CreateCourseRequest;
import com.saas.cours.controller.dto.CreateLessonRequest;
import com.saas.cours.controller.dto.InstructorCourseDetailResponse;
import com.saas.cours.controller.dto.UpdateCourseRequest;
import com.saas.cours.controller.dto.UpdateLessonRequest;
import com.saas.cours.domain.Course;
import com.saas.cours.domain.Lesson;
import com.saas.cours.domain.User;
import com.saas.cours.domain.enums.CourseLevel;
import com.saas.cours.domain.enums.LessonType;
import com.saas.cours.exception.ForbiddenActionException;
import com.saas.cours.exception.ResourceNotFoundException;
import com.saas.cours.repository.CourseRepository;
import com.saas.cours.repository.LessonRepository;
import com.saas.cours.repository.UserRepository;
import com.saas.cours.security.CurrentUserService;
import com.saas.cours.support.TestUsers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class InstructorCatalogServiceTest {

    @Autowired
    private InstructorCatalogService instructorCatalogService;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private UserRepository userRepository;

    @MockBean
    private CurrentUserService currentUserService;

    private User instructor;
    private User student;

    @BeforeEach
    void setUp() {
        instructor = userRepository.save(TestUsers.instructor("instructor-catalog@test.com"));
        student = userRepository.save(TestUsers.student("student-catalog@test.com"));
    }

    @Test
    void createCourseCreatesDraftCourse() {
        when(currentUserService.getCurrentUser()).thenReturn(instructor);

        InstructorCourseDetailResponse response = instructorCatalogService.createCourse(
                new CreateCourseRequest("Mon cours", "Description", CourseLevel.DEBUTANT)
        );

        assertThat(response.published()).isFalse();
        assertThat(response.title()).isEqualTo("Mon cours");
    }

    @Test
    void studentCannotManageCourses() {
        when(currentUserService.getCurrentUser()).thenReturn(student);

        assertThatThrownBy(() -> instructorCatalogService.createCourse(
                new CreateCourseRequest("Cours", null, CourseLevel.DEBUTANT)
        )).isInstanceOf(ForbiddenActionException.class);
    }

    @Test
    void addFirstLessonKeepsCourseDraft() {
        when(currentUserService.getCurrentUser()).thenReturn(instructor);

        InstructorCourseDetailResponse course = instructorCatalogService.createCourse(
                new CreateCourseRequest("Cours vidéo", null, CourseLevel.DEBUTANT)
        );

        instructorCatalogService.addLesson(course.id(), new CreateLessonRequest(
                "Leçon 1",
                null,
                LessonType.VIDEO,
                "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                10
        ));

        Course updated = courseRepository.findById(course.id()).orElseThrow();
        assertThat(updated.isPublished()).isFalse();
    }

    @Test
    void addLessonRejectsMixedLessonTypes() {
        when(currentUserService.getCurrentUser()).thenReturn(instructor);

        InstructorCourseDetailResponse course = instructorCatalogService.createCourse(
                new CreateCourseRequest("Cours PDF", null, CourseLevel.DEBUTANT)
        );

        instructorCatalogService.addLesson(course.id(), new CreateLessonRequest(
                "Leçon PDF",
                null,
                LessonType.PDF,
                "https://example.com/doc.pdf",
                null
        ));

        assertThatThrownBy(() -> instructorCatalogService.addLesson(course.id(), new CreateLessonRequest(
                "Leçon vidéo",
                null,
                LessonType.VIDEO,
                "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                5
        ))).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("même type");
    }

    @Test
    void updateCourseAllowsTitleDescriptionAndPublished() {
        when(currentUserService.getCurrentUser()).thenReturn(instructor);

        InstructorCourseDetailResponse course = instructorCatalogService.createCourse(
                new CreateCourseRequest("Ancien titre", "Ancienne description", CourseLevel.DEBUTANT)
        );
        instructorCatalogService.addLesson(course.id(), new CreateLessonRequest(
                "Leçon PDF",
                null,
                LessonType.PDF,
                "https://example.com/doc.pdf",
                null
        ));

        instructorCatalogService.updateCourse(course.id(), new UpdateCourseRequest(
                null,
                null,
                null,
                true
        ));

        InstructorCourseDetailResponse updated = instructorCatalogService.updateCourse(course.id(), new UpdateCourseRequest(
                "Nouveau titre",
                "Nouvelle description",
                CourseLevel.AVANCE,
                false
        ));

        assertThat(updated.title()).isEqualTo("Nouveau titre");
        assertThat(updated.description()).isEqualTo("Nouvelle description");
        assertThat(updated.level()).isEqualTo(CourseLevel.AVANCE);
        assertThat(updated.published()).isFalse();
    }

    @Test
    void publishCourseWithoutLessonsIsRejected() {
        when(currentUserService.getCurrentUser()).thenReturn(instructor);

        InstructorCourseDetailResponse course = instructorCatalogService.createCourse(
                new CreateCourseRequest("Cours vide", null, CourseLevel.DEBUTANT)
        );

        assertThatThrownBy(() -> instructorCatalogService.updateCourse(course.id(), new UpdateCourseRequest(
                null,
                null,
                null,
                true
        ))).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("leçon");
    }

    @Test
    void updateLessonUpdatesFieldsAndPosition() {
        when(currentUserService.getCurrentUser()).thenReturn(instructor);

        InstructorCourseDetailResponse course = instructorCatalogService.createCourse(
                new CreateCourseRequest("Cours", null, CourseLevel.DEBUTANT)
        );
        var lesson1 = instructorCatalogService.addLesson(course.id(), new CreateLessonRequest(
                "Leçon 1",
                null,
                LessonType.PDF,
                "https://example.com/one.pdf",
                null
        ));
        var lesson2 = instructorCatalogService.addLesson(course.id(), new CreateLessonRequest(
                "Leçon 2",
                null,
                LessonType.PDF,
                "https://example.com/two.pdf",
                null
        ));

        var updated = instructorCatalogService.updateLesson(course.id(), lesson2.id(), new UpdateLessonRequest(
                "Leçon 2 renommée",
                "Description",
                "https://example.com/two-updated.pdf",
                null,
                1
        ));

        assertThat(updated.title()).isEqualTo("Leçon 2 renommée");
        assertThat(updated.description()).isEqualTo("Description");
        assertThat(updated.contentUrl()).isEqualTo("https://example.com/two-updated.pdf");
        assertThat(updated.position()).isEqualTo(1);

        Lesson first = lessonRepository.findById(lesson1.id()).orElseThrow();
        assertThat(first.getPosition()).isEqualTo(2);
    }

    @Test
    void deleteLastLessonUnpublishesCourse() {
        when(currentUserService.getCurrentUser()).thenReturn(instructor);

        InstructorCourseDetailResponse course = instructorCatalogService.createCourse(
                new CreateCourseRequest("Cours", null, CourseLevel.DEBUTANT)
        );
        var lesson = instructorCatalogService.addLesson(course.id(), new CreateLessonRequest(
                "Leçon PDF",
                null,
                LessonType.PDF,
                "https://example.com/doc.pdf",
                null
        ));

        instructorCatalogService.updateCourse(course.id(), new UpdateCourseRequest(
                null,
                null,
                null,
                true
        ));

        instructorCatalogService.deleteLesson(course.id(), lesson.id());

        Course updated = courseRepository.findById(course.id()).orElseThrow();
        assertThat(updated.isPublished()).isFalse();
        assertThat(updated.getLessons()).isEmpty();
    }

    @Test
    void deleteLessonReordersRemainingPositions() {
        when(currentUserService.getCurrentUser()).thenReturn(instructor);

        InstructorCourseDetailResponse course = instructorCatalogService.createCourse(
                new CreateCourseRequest("Cours", null, CourseLevel.DEBUTANT)
        );
        var lesson1 = instructorCatalogService.addLesson(course.id(), new CreateLessonRequest(
                "Leçon 1",
                null,
                LessonType.PDF,
                "https://example.com/one.pdf",
                null
        ));
        var lesson2 = instructorCatalogService.addLesson(course.id(), new CreateLessonRequest(
                "Leçon 2",
                null,
                LessonType.PDF,
                "https://example.com/two.pdf",
                null
        ));
        instructorCatalogService.addLesson(course.id(), new CreateLessonRequest(
                "Leçon 3",
                null,
                LessonType.PDF,
                "https://example.com/three.pdf",
                null
        ));

        instructorCatalogService.deleteLesson(course.id(), lesson2.id());

        Lesson first = lessonRepository.findById(lesson1.id()).orElseThrow();
        assertThat(first.getPosition()).isEqualTo(1);
        assertThat(lessonRepository.findByCourseIdOrderByPositionAsc(course.id()))
                .extracting(Lesson::getPosition)
                .containsExactly(1, 2);
    }

    @Test
    void deleteCourseRequiresOwnership() {
        when(currentUserService.getCurrentUser()).thenReturn(instructor);

        InstructorCourseDetailResponse course = instructorCatalogService.createCourse(
                new CreateCourseRequest("Cours", null, CourseLevel.DEBUTANT)
        );

        User otherInstructor = userRepository.save(TestUsers.instructor("other-instructor@test.com"));
        when(currentUserService.getCurrentUser()).thenReturn(otherInstructor);

        assertThatThrownBy(() -> instructorCatalogService.deleteCourse(course.id()))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
