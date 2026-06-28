package com.saas.cours.validation;

import com.saas.cours.controller.dto.CreateLessonRequest;
import com.saas.cours.domain.enums.LessonType;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class CreateLessonRequestValidatorTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void validVideoLessonPassesValidation() {
        CreateLessonRequest request = new CreateLessonRequest(
                "Vidéo",
                null,
                LessonType.VIDEO,
                "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                15
        );

        Set<ConstraintViolation<CreateLessonRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }

    @Test
    void videoLessonWithoutDurationFailsValidation() {
        CreateLessonRequest request = new CreateLessonRequest(
                "Vidéo",
                null,
                LessonType.VIDEO,
                "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                null
        );

        Set<ConstraintViolation<CreateLessonRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(v -> v.getPropertyPath().toString())
                .contains("durationMinutes");
    }

    @Test
    void videoLessonWithInvalidYouTubeUrlFailsValidation() {
        CreateLessonRequest request = new CreateLessonRequest(
                "Vidéo",
                null,
                LessonType.VIDEO,
                "https://example.com/not-youtube",
                10
        );

        Set<ConstraintViolation<CreateLessonRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(v -> v.getPropertyPath().toString())
                .contains("contentUrl");
    }

    @Test
    void validPdfLessonPassesValidation() {
        CreateLessonRequest request = new CreateLessonRequest(
                "PDF",
                null,
                LessonType.PDF,
                "https://example.com/document.pdf",
                null
        );

        Set<ConstraintViolation<CreateLessonRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }

    @Test
    void pdfLessonWithInvalidUrlFailsValidation() {
        CreateLessonRequest request = new CreateLessonRequest(
                "PDF",
                null,
                LessonType.PDF,
                "http://example.com/document.pdf",
                null
        );

        Set<ConstraintViolation<CreateLessonRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(v -> v.getPropertyPath().toString())
                .contains("contentUrl");
    }
}
