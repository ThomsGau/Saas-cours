package com.saas.cours.service;

import com.saas.cours.controller.dto.CourseDetailResponse;
import com.saas.cours.controller.dto.CourseSummaryResponse;
import com.saas.cours.controller.dto.InstructorCourseDetailResponse;
import com.saas.cours.controller.dto.LessonPreviewResponse;
import com.saas.cours.controller.dto.LessonResponse;
import com.saas.cours.domain.Course;
import com.saas.cours.domain.Lesson;
import com.saas.cours.util.CourseDurationUtils;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
public class CourseMapper {

    public CourseSummaryResponse toSummary(Course course) {
        Lesson primaryLesson = resolvePrimaryLesson(course);
        int totalDurationMinutes = CourseDurationUtils.sumVideoDurationMinutes(course);
        return new CourseSummaryResponse(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getLevel(),
                course.isPublished(),
                course.getInstructor().getId(),
                course.getInstructor().getEmail(),
                primaryLesson != null ? primaryLesson.getLessonType() : null,
                totalDurationMinutes > 0 ? totalDurationMinutes : null
        );
    }

    public CourseDetailResponse toDetail(Course course) {
        List<LessonPreviewResponse> lessons = course.getLessons().stream()
                .map(this::toLessonPreviewResponse)
                .toList();
        return new CourseDetailResponse(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getLevel(),
                course.isPublished(),
                course.getInstructor().getId(),
                course.getInstructor().getEmail(),
                lessons
        );
    }

    public InstructorCourseDetailResponse toInstructorDetail(Course course) {
        List<LessonResponse> lessons = course.getLessons().stream()
                .map(this::toLessonResponse)
                .toList();
        return new InstructorCourseDetailResponse(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getLevel(),
                course.isPublished(),
                course.getInstructor().getId(),
                course.getInstructor().getEmail(),
                lessons
        );
    }

    public LessonPreviewResponse toLessonPreviewResponse(Lesson lesson) {
        return new LessonPreviewResponse(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getDescription(),
                lesson.getLessonType(),
                lesson.getPosition(),
                lesson.getDurationMinutes()
        );
    }

    public LessonResponse toLessonResponse(Lesson lesson) {
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

    public Lesson resolvePrimaryLesson(Course course) {
        return course.getLessons().stream()
                .min(Comparator.comparing(Lesson::getPosition))
                .orElse(null);
    }
}
