package com.saas.cours.exception;



import com.fasterxml.jackson.databind.exc.InvalidFormatException;

import org.springframework.dao.OptimisticLockingFailureException;

import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;

import org.springframework.http.converter.HttpMessageNotReadableException;

import org.springframework.security.authentication.BadCredentialsException;

import org.springframework.security.core.userdetails.UsernameNotFoundException;

import org.springframework.validation.FieldError;

import org.springframework.web.bind.MethodArgumentNotValidException;

import org.springframework.web.bind.annotation.ExceptionHandler;

import org.springframework.web.bind.annotation.RestControllerAdvice;



import java.util.LinkedHashMap;

import java.util.Map;



@RestControllerAdvice

public class GlobalExceptionHandler {



    @ExceptionHandler(MethodArgumentNotValidException.class)

    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = new LinkedHashMap<>();

        for (FieldError error : ex.getBindingResult().getFieldErrors()) {

            fieldErrors.put(error.getField(), error.getDefaultMessage());

        }

        return ResponseEntity.badRequest().body(new ApiErrorResponse(

                HttpStatus.BAD_REQUEST.value(),

                "Validation échouée",

                "Les données envoyées sont invalides.",

                fieldErrors

        ));

    }



    @ExceptionHandler(EmailAlreadyExistsException.class)

    public ResponseEntity<ApiErrorResponse> handleEmailAlreadyExists(EmailAlreadyExistsException ex) {

        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiErrorResponse(

                HttpStatus.CONFLICT.value(),

                "Conflit",

                ex.getMessage()

        ));

    }



    @ExceptionHandler(InvalidRoleException.class)

    public ResponseEntity<ApiErrorResponse> handleInvalidRole(InvalidRoleException ex) {

        return ResponseEntity.badRequest().body(new ApiErrorResponse(

                HttpStatus.BAD_REQUEST.value(),

                "Rôle invalide",

                ex.getMessage()

        ));

    }



    @ExceptionHandler(IllegalArgumentException.class)

    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {

        return ResponseEntity.badRequest().body(new ApiErrorResponse(

                HttpStatus.BAD_REQUEST.value(),

                "Requête invalide",

                ex.getMessage()

        ));

    }



    @ExceptionHandler(HttpMessageNotReadableException.class)

    public ResponseEntity<ApiErrorResponse> handleUnreadableMessage(HttpMessageNotReadableException ex) {

        String message = "Corps de requête invalide.";

        Throwable cause = ex.getCause();



        if (cause instanceof InvalidFormatException invalidFormat) {

            if (invalidFormat.getTargetType() != null && invalidFormat.getTargetType().isEnum()) {

                message = "Valeur invalide : " + invalidFormat.getValue();

            }

        } else if (cause instanceof IllegalArgumentException illegalArgument) {

            message = illegalArgument.getMessage();

        }



        return ResponseEntity.badRequest().body(new ApiErrorResponse(

                HttpStatus.BAD_REQUEST.value(),

                "Requête invalide",

                message

        ));

    }



    @ExceptionHandler(PaymentProcessingException.class)

    public ResponseEntity<ApiErrorResponse> handlePaymentProcessing(PaymentProcessingException ex) {

        return ResponseEntity.badRequest().body(new ApiErrorResponse(

                HttpStatus.BAD_REQUEST.value(),

                "Paiement impossible",

                ex.getMessage()

        ));

    }



    @ExceptionHandler(SubscriptionRequiredException.class)

    public ResponseEntity<ApiErrorResponse> handleSubscriptionRequired(SubscriptionRequiredException ex) {

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiErrorResponse(

                HttpStatus.FORBIDDEN.value(),

                "Abonnement requis",

                ex.getMessage()

        ));

    }



    @ExceptionHandler(ResourceNotFoundException.class)

    public ResponseEntity<ApiErrorResponse> handleNotFound(ResourceNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiErrorResponse(

                HttpStatus.NOT_FOUND.value(),

                "Ressource introuvable",

                ex.getMessage()

        ));

    }



    @ExceptionHandler(OptimisticLockingFailureException.class)

    public ResponseEntity<ApiErrorResponse> handleOptimisticLock(OptimisticLockingFailureException ex) {

        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiErrorResponse(

                HttpStatus.CONFLICT.value(),

                "Créneau indisponible",

                "Ce créneau n'est plus disponible."

        ));

    }



    @ExceptionHandler({SlotNotAvailableException.class})

    public ResponseEntity<ApiErrorResponse> handleSlotNotAvailable(SlotNotAvailableException ex) {

        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiErrorResponse(

                HttpStatus.CONFLICT.value(),

                "Créneau indisponible",

                ex.getMessage()

        ));

    }



    @ExceptionHandler(ForbiddenActionException.class)

    public ResponseEntity<ApiErrorResponse> handleForbidden(ForbiddenActionException ex) {

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiErrorResponse(

                HttpStatus.FORBIDDEN.value(),

                "Action interdite",

                ex.getMessage()

        ));

    }



    @ExceptionHandler({BadCredentialsException.class, UsernameNotFoundException.class})

    public ResponseEntity<ApiErrorResponse> handleBadCredentials(RuntimeException ex) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiErrorResponse(

                HttpStatus.UNAUTHORIZED.value(),

                "Authentification échouée",

                "Email ou mot de passe incorrect."

        ));

    }

}

