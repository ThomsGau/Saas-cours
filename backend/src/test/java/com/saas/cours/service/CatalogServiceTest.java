package com.saas.cours.service;

import com.saas.cours.controller.dto.CourseDetailResponse;
import com.saas.cours.controller.dto.CourseSummaryResponse;
import com.saas.cours.controller.dto.LessonResponse;
import com.saas.cours.domain.Course;
import com.saas.cours.domain.Lesson;
import com.saas.cours.domain.User;
import com.saas.cours.domain.enums.CourseLevel;
import com.saas.cours.domain.enums.LessonType;
import com.saas.cours.domain.enums.SubscriptionStatus;
import com.saas.cours.exception.SubscriptionRequiredException;
import com.saas.cours.repository.CourseRepository;
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

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CatalogServiceTest {

    @Autowired
    private CatalogService catalogService;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @MockBean
    private CurrentUserService currentUserService;

    private User instructor;
    private User subscribedStudent;
    private User unsubscribedStudent;

    @BeforeEach
    void setUp() {
        instructor = userRepository.save(TestUsers.instructor("catalog-instructor@test.com"));
        subscribedStudent = userRepository.save(TestUsers.student("catalog-student@test.com"));
        subscribedStudent.setSubscriptionStatus(SubscriptionStatus.ACTIVE);
        subscribedStudent = userRepository.save(subscribedStudent);
        unsubscribedStudent = userRepository.save(TestUsers.student("catalog-unsubscribed@test.com"));
        when(currentUserService.getCurrentUser()).thenReturn(subscribedStudent);
    }

    @Test
    void listPublishedCoursesReturnsPrimaryLessonTypeFromFirstLesson() {
        Course videoCourse = savePublishedCourse("Cours vidéo");
        videoCourse.addLesson(Lesson.builder()
                .title("Leçon vidéo")
                .lessonType(LessonType.VIDEO)
                .contentUrl("https://www.youtube.com/watch?v=test")
                .position(1)
                .build());
        courseRepository.save(videoCourse);

        Course pdfCourse = savePublishedCourse("Cours PDF");
        pdfCourse.addLesson(Lesson.builder()
                .title("Leçon PDF")
                .lessonType(LessonType.PDF)
                .contentUrl("https://example.com/doc.pdf")
                .position(1)
                .build());
        courseRepository.save(pdfCourse);

        Course emptyCourse = savePublishedCourse("Cours sans leçon");
        courseRepository.save(emptyCourse);

        List<CourseSummaryResponse> summaries = catalogService.listPublishedCourses();

        assertThat(summaries).extracting(CourseSummaryResponse::primaryLessonType)
                .contains(LessonType.VIDEO, LessonType.PDF, null);
    }

    @Test
    void listPublishedCoursesWorksWithoutActiveSubscription() {
        when(currentUserService.getCurrentUser()).thenReturn(unsubscribedStudent);

        Course course = savePublishedCourse("Cours aperçu");
        courseRepository.save(course);

        List<CourseSummaryResponse> summaries = catalogService.listPublishedCourses();

        assertThat(summaries).extracting(CourseSummaryResponse::title)
                .contains("Cours aperçu");
    }

    @Test
    void listPublishedCoursesUsesLowestPositionLessonAsPrimaryType() {
        Course course = savePublishedCourse("Cours mixte");
        course.addLesson(Lesson.builder()
                .title("PDF secondaire")
                .lessonType(LessonType.PDF)
                .contentUrl("https://example.com/doc.pdf")
                .position(2)
                .build());
        course.addLesson(Lesson.builder()
                .title("Vidéo principale")
                .lessonType(LessonType.VIDEO)
                .contentUrl("https://www.youtube.com/watch?v=test")
                .position(1)
                .build());
        courseRepository.save(course);

        CourseSummaryResponse summary = catalogService.listPublishedCourses().stream()
                .filter(item -> item.title().equals("Cours mixte"))
                .findFirst()
                .orElseThrow();

        assertThat(summary.primaryLessonType()).isEqualTo(LessonType.VIDEO);
    }

    @Test
    void listPublishedCoursesReturnsTotalVideoDurationMinutes() {
        Course course = savePublishedCourse("Cours avec durées");
        course.addLesson(Lesson.builder()
                .title("Vidéo 1")
                .lessonType(LessonType.VIDEO)
                .contentUrl("https://www.youtube.com/watch?v=one")
                .position(1)
                .durationMinutes(45)
                .build());
        course.addLesson(Lesson.builder()
                .title("Vidéo 2")
                .lessonType(LessonType.VIDEO)
                .contentUrl("https://www.youtube.com/watch?v=two")
                .position(2)
                .durationMinutes(75)
                .build());
        course.addLesson(Lesson.builder()
                .title("PDF sans durée")
                .lessonType(LessonType.PDF)
                .contentUrl("https://example.com/doc.pdf")
                .position(3)
                .build());
        courseRepository.save(course);

        CourseSummaryResponse summary = catalogService.listPublishedCourses().stream()
                .filter(item -> item.title().equals("Cours avec durées"))
                .findFirst()
                .orElseThrow();

        assertThat(summary.totalDurationMinutes()).isEqualTo(120);
    }

    @Test
    void listPublishedCoursesReturnsNullTotalDurationWhenNoVideoDurations() {
        Course course = savePublishedCourse("Cours sans durée vidéo");
        course.addLesson(Lesson.builder()
                .title("Vidéo sans durée")
                .lessonType(LessonType.VIDEO)
                .contentUrl("https://www.youtube.com/watch?v=test")
                .position(1)
                .build());
        courseRepository.save(course);

        CourseSummaryResponse summary = catalogService.listPublishedCourses().stream()
                .filter(item -> item.title().equals("Cours sans durée vidéo"))
                .findFirst()
                .orElseThrow();

        assertThat(summary.totalDurationMinutes()).isNull();
    }

    @Test
    void listPublishedCoursesReturnsCourseLevel() {
        Course course = savePublishedCourse("Cours niveau avancé");
        course.setLevel(CourseLevel.AVANCE);
        courseRepository.save(course);

        CourseSummaryResponse summary = catalogService.listPublishedCourses().stream()
                .filter(item -> item.title().equals("Cours niveau avancé"))
                .findFirst()
                .orElseThrow();

        assertThat(summary.level()).isEqualTo(CourseLevel.AVANCE);
    }

    @Test
    void getPublishedCourseRequiresActiveSubscription() {
        Course course = savePublishedCourse("Cours protégé");
        course.addLesson(Lesson.builder()
                .title("Leçon")
                .lessonType(LessonType.VIDEO)
                .contentUrl("https://www.youtube.com/watch?v=test")
                .position(1)
                .build());
        courseRepository.save(course);

        when(currentUserService.getCurrentUser()).thenReturn(unsubscribedStudent);

        assertThatThrownBy(() -> catalogService.getPublishedCourse(course.getId()))
                .isInstanceOf(SubscriptionRequiredException.class);
    }

    @Test
    void getPublishedCourseReturnsLessonsWithoutContentUrl() {
        Course course = savePublishedCourse("Cours détail");
        course.addLesson(Lesson.builder()
                .title("Leçon vidéo")
                .lessonType(LessonType.VIDEO)
                .contentUrl("https://www.youtube.com/watch?v=secret")
                .position(1)
                .build());
        courseRepository.save(course);

        CourseDetailResponse detail = catalogService.getPublishedCourse(course.getId());

        assertThat(detail.lessons()).hasSize(1);
        assertThat(detail.lessons().get(0).title()).isEqualTo("Leçon vidéo");
    }

    @Test
    void getLessonReturnsContentUrlForSubscribedStudent() {
        Course course = savePublishedCourse("Cours leçon");
        course.addLesson(Lesson.builder()
                .title("Leçon vidéo")
                .lessonType(LessonType.VIDEO)
                .contentUrl("https://www.youtube.com/watch?v=abc123")
                .position(1)
                .build());
        courseRepository.save(course);

        Lesson savedLesson = course.getLessons().get(0);
        LessonResponse lesson = catalogService.getLesson(course.getId(), savedLesson.getId());

        assertThat(lesson.contentUrl()).isEqualTo("https://www.youtube.com/watch?v=abc123");
    }

    private Course savePublishedCourse(String title) {
        return courseRepository.save(Course.builder()
                .title(title)
                .description("Description")
                .published(true)
                .instructor(instructor)
                .build());
    }
}
