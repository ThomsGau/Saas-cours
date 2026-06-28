import { extractYouTubeId } from "@/lib/video/video-url";

const PDF_ALLOWED_HOSTS = new Set(["drive.google.com", "docs.google.com"]);

export function isValidYouTubeLessonUrl(url: string): boolean {
  return extractYouTubeId(url) != null;
}

export function isValidPdfLessonUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "https:") {
      return false;
    }

    const host = parsed.hostname.replace(/^www\./, "");
    if (PDF_ALLOWED_HOSTS.has(host)) {
      return true;
    }

    return parsed.pathname.toLowerCase().endsWith(".pdf");
  } catch {
    return false;
  }
}
