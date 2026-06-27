package com.saas.cours.controller;

import com.saas.cours.controller.dto.CourseDetailResponse;
import com.saas.cours.controller.dto.CourseSummaryResponse;
import com.saas.cours.controller.dto.CreateCourseRequest;
import com.saas.cours.controller.dto.CreateLessonRequest;
import com.saas.cours.controller.dto.LessonResponse;
import com.saas.cours.service.InstructorCatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/me/instructor/courses")
@RequiredArgsConstructor
public class InstructorCatalogController {

    private final InstructorCatalogService instructorCatalogService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CourseDetailResponse createCourse(@Valid @RequestBody CreateCourseRequest request) {
        return instructorCatalogService.createCourse(request);
    }

    @GetMapping
    public List<CourseSummaryResponse> listMyCourses() {
        return instructorCatalogService.listMyCourses();
    }

    @GetMapping("/{courseId}")
    public CourseDetailResponse getMyCourse(@PathVariable Long courseId) {
        return instructorCatalogService.getMyCourse(courseId);
    }

    @PostMapping("/{courseId}/lessons")
    @ResponseStatus(HttpStatus.CREATED)
    public LessonResponse addLesson(
            @PathVariable Long courseId,
            @Valid @RequestBody CreateLessonRequest request
    ) {
        return instructorCatalogService.addLesson(courseId, request);
    }

    @DeleteMapping("/{courseId}/lessons/{lessonId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLesson(@PathVariable Long courseId, @PathVariable Long lessonId) {
        instructorCatalogService.deleteLesson(courseId, lessonId);
    }

    @DeleteMapping("/{courseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCourse(@PathVariable Long courseId) {
        instructorCatalogService.deleteCourse(courseId);
    }
}
