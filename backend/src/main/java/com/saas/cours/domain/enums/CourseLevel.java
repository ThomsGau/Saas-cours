package com.saas.cours.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum CourseLevel {
    DEBUTANT("Débutant"),
    INTERMEDIAIRE("Intermédiaire"),
    AVANCE("Avancé");

    private final String label;

    CourseLevel(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static CourseLevel fromLabel(String value) {
        return Arrays.stream(values())
                .filter(level -> level.label.equals(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Niveau invalide: " + value));
    }
}
