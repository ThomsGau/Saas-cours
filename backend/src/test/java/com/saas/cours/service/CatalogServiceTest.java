package com.saas.cours.service;

import com.saas.cours.controller.dto.CourseSummaryResponse;
import com.saas.cours.domain.Course;
import com.saas.cours.domain.Lesson;
import com.saas.cours.domain.User;
import com.saas.cours.domain.enums.LessonType;
import com.saas.cours.domain.enums.SubscriptionStatus;
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

    @BeforeEach
    void setUp() {
        instructor = userRepository.save(TestUsers.instructor("catalog-instructor@test.com"));
        subscribedStudent = userRepository.save(TestUsers.student("catalog-student@test.com"));
        subscribedStudent.setSubscriptionStatus(SubscriptionStatus.ACTIVE);
        subscribedStudent = userRepository.save(subscribedStudent);
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

    private Course savePublishedCourse(String title) {
        return courseRepository.save(Course.builder()
                .title(title)
                .description("Description")
                .published(true)
                .instructor(instructor)
                .build());
    }
}
