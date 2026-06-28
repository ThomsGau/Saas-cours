package com.saas.cours.util;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

class LessonContentUrlValidatorTest {

    @ParameterizedTest
    @ValueSource(strings = {
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "https://youtu.be/dQw4w9WgXcQ",
            "https://www.youtube.com/embed/dQw4w9WgXcQ"
    })
    void acceptsValidYouTubeUrls(String url) {
        assertThat(LessonContentUrlValidator.isValidYouTubeUrl(url)).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "https://example.com/video.mp4",
            "https://www.youtube.com/",
            "not-a-url"
    })
    void rejectsInvalidYouTubeUrls(String url) {
        assertThat(LessonContentUrlValidator.isValidYouTubeUrl(url)).isFalse();
    }

    @Test
    void acceptsValidPdfUrl() {
        assertThat(LessonContentUrlValidator.isValidPdfUrl("https://example.com/doc.pdf")).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "https://drive.google.com/file/d/abc123/view",
            "https://docs.google.com/document/d/abc123/edit"
    })
    void acceptsGoogleDrivePdfUrls(String url) {
        assertThat(LessonContentUrlValidator.isValidPdfUrl(url)).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "http://example.com/doc.pdf",
            "https://example.com/doc",
            "https://example.com/doc.pdfx"
    })
    void rejectsInvalidPdfUrls(String url) {
        assertThat(LessonContentUrlValidator.isValidPdfUrl(url)).isFalse();
    }
}
