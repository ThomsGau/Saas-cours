import { extractYouTubeId } from "@/lib/video/video-url";

export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url.trim()) !== null;
}

export function isValidPdfUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "https:") {
      return false;
    }
    return parsed.pathname.toLowerCase().endsWith(".pdf");
  } catch {
    return false;
  }
}
