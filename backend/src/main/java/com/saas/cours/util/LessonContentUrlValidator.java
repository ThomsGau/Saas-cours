package com.saas.cours.util;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class LessonContentUrlValidator {

    private static final Pattern EMBED_PATH = Pattern.compile("^/(embed|shorts)/([^/]+)");
    private static final Set<String> PDF_ALLOWED_HOSTS = Set.of(
            "drive.google.com",
            "docs.google.com"
    );

    private LessonContentUrlValidator() {
    }

    public static boolean isValidYouTubeUrl(String url) {
        try {
            URI uri = new URI(url.trim());
            String host = normalizeHost(uri.getHost());
            if (host == null) {
                return false;
            }

            if ("youtu.be".equals(host)) {
                String id = uri.getPath();
                return id != null && id.length() > 1 && !id.substring(1).isBlank();
            }

            if ("youtube.com".equals(host) || "m.youtube.com".equals(host)) {
                String path = uri.getPath() != null ? uri.getPath() : "";
                if ("/watch".equals(path)) {
                    return queryParam(uri, "v") != null && !queryParam(uri, "v").isBlank();
                }
                Matcher embedMatch = EMBED_PATH.matcher(path);
                return embedMatch.find() && embedMatch.group(2) != null && !embedMatch.group(2).isBlank();
            }

            return false;
        } catch (URISyntaxException ex) {
            return false;
        }
    }

    public static boolean isValidPdfUrl(String url) {
        try {
            URI uri = new URI(url.trim());
            if (!"https".equalsIgnoreCase(uri.getScheme())) {
                return false;
            }

            String host = normalizeHost(uri.getHost());
            if (host != null && PDF_ALLOWED_HOSTS.contains(host)) {
                return true;
            }

            String path = uri.getPath();
            return path != null && path.toLowerCase().endsWith(".pdf");
        } catch (URISyntaxException ex) {
            return false;
        }
    }

    private static String normalizeHost(String host) {
        if (host == null) {
            return null;
        }
        return host.startsWith("www.") ? host.substring(4) : host;
    }

    private static String queryParam(URI uri, String name) {
        String query = uri.getQuery();
        if (query == null || query.isBlank()) {
            return null;
        }
        for (String pair : query.split("&")) {
            int separator = pair.indexOf('=');
            if (separator <= 0) {
                continue;
            }
            if (name.equals(pair.substring(0, separator))) {
                return pair.substring(separator + 1);
            }
        }
        return null;
    }
}
