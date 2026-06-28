package com.saas.cours.validation;

import com.saas.cours.controller.dto.CreateLessonRequest;
import com.saas.cours.domain.enums.LessonType;
import com.saas.cours.util.LessonContentUrlValidator;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CreateLessonRequestValidator
        implements ConstraintValidator<ValidCreateLessonRequest, CreateLessonRequest> {

    @Override
    public boolean isValid(CreateLessonRequest request, ConstraintValidatorContext context) {
        if (request == null || request.lessonType() == null) {
            return true;
        }

        context.disableDefaultConstraintViolation();
        boolean valid = true;

        if (request.lessonType() == LessonType.VIDEO) {
            if (request.durationMinutes() == null) {
                addViolation(context, "durationMinutes", "La durée est obligatoire pour une leçon vidéo.");
                valid = false;
            }
            if (request.contentUrl() == null || !LessonContentUrlValidator.isValidYouTubeUrl(request.contentUrl())) {
                addViolation(context, "contentUrl", "Lien YouTube invalide.");
                valid = false;
            }
        } else if (request.lessonType() == LessonType.PDF) {
            if (request.contentUrl() == null || !LessonContentUrlValidator.isValidPdfUrl(request.contentUrl())) {
                addViolation(context, "contentUrl", "Lien PDF invalide (https://…/fichier.pdf requis).");
                valid = false;
            }
        }

        return valid;
    }

    private void addViolation(ConstraintValidatorContext context, String field, String message) {
        context.buildConstraintViolationWithTemplate(message)
                .addPropertyNode(field)
                .addConstraintViolation();
    }
}
