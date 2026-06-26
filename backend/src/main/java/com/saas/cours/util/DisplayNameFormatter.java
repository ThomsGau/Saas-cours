package com.saas.cours.util;

import com.saas.cours.domain.User;

import java.util.Arrays;
import java.util.Locale;
import java.util.stream.Collectors;

public final class DisplayNameFormatter {

    private DisplayNameFormatter() {
    }

    public static String fromFirstAndLastName(String firstName, String lastName) {
        String trimmedFirst = normalizePart(firstName);
        String trimmedLast = normalizePart(lastName);

        if (trimmedLast.isEmpty() && trimmedFirst.isEmpty()) {
            return "";
        }
        if (trimmedLast.isEmpty()) {
            return capitalizeName(trimmedFirst);
        }
        if (trimmedFirst.isEmpty()) {
            return trimmedLast.toUpperCase(Locale.FRENCH);
        }
        return trimmedLast.toUpperCase(Locale.FRENCH) + " " + capitalizeName(trimmedFirst);
    }

    public static String resolveDisplayName(User user) {
        if (hasFirstAndLastName(user)) {
            return fromFirstAndLastName(user.getFirstName(), user.getLastName());
        }
        if (user.getDisplayName() != null && !user.getDisplayName().isBlank()) {
            return user.getDisplayName().trim();
        }
        return fromEmail(user.getEmail());
    }

    public static boolean hasFirstAndLastName(User user) {
        return user.getFirstName() != null
                && !user.getFirstName().isBlank()
                && user.getLastName() != null
                && !user.getLastName().isBlank();
    }

    public static String fromEmail(String email) {
        String localPart = email.split("@")[0];
        return fromEmailLocalPart(localPart);
    }

    public static String fromEmailLocalPart(String localPart) {
        String[] parts = localPart.split("[._-]");
        StringBuilder builder = new StringBuilder();
        for (String part : parts) {
            if (part.isEmpty()) {
                continue;
            }
            if (!builder.isEmpty()) {
                builder.append(' ');
            }
            builder.append(Character.toUpperCase(part.charAt(0)));
            if (part.length() > 1) {
                builder.append(part.substring(1));
            }
        }
        return builder.isEmpty() ? localPart : builder.toString();
    }

    private static String normalizePart(String value) {
        return value == null ? "" : value.trim();
    }

    private static String capitalizeName(String value) {
        return Arrays.stream(value.split("\\s+"))
                .filter(part -> !part.isEmpty())
                .map(DisplayNameFormatter::capitalizeToken)
                .collect(Collectors.joining(" "));
    }

    private static String capitalizeToken(String token) {
        if (token.contains("-")) {
            return Arrays.stream(token.split("-"))
                    .filter(part -> !part.isEmpty())
                    .map(DisplayNameFormatter::capitalizeToken)
                    .collect(Collectors.joining("-"));
        }
        if (token.isEmpty()) {
            return token;
        }
        return token.substring(0, 1).toUpperCase(Locale.FRENCH)
                + token.substring(1).toLowerCase(Locale.FRENCH);
    }
}
