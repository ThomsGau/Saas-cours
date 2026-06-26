package com.saas.cours.controller;

import com.saas.cours.controller.dto.CourseDetailResponse;
import com.saas.cours.controller.dto.CourseSummaryResponse;
import com.saas.cours.controller.dto.LessonResponse;
import com.saas.cours.service.CatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/catalog")
@RequiredArgsConstructor
public class CatalogController {

    private final CatalogService catalogService;

    @GetMapping("/courses")
    public List<CourseSummaryResponse> listCourses() {
        return catalogService.listPublishedCourses();
    }

    @GetMapping("/courses/{courseId}")
    public CourseDetailResponse getCourse(@PathVariable Long courseId) {
        return catalogService.getPublishedCourse(courseId);
    }

    @GetMapping("/courses/{courseId}/lessons/{lessonId}")
    public LessonResponse getLesson(
            @PathVariable Long courseId,
            @PathVariable Long lessonId
    ) {
        return catalogService.getLesson(courseId, lessonId);
    }
}
