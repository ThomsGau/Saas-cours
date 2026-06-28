export function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1);
      return id || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }

      const embedMatch = parsed.pathname.match(/^\/(embed|shorts)\/([^/]+)/);
      if (embedMatch) {
        return embedMatch[2];
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function extractVimeoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host !== "vimeo.com" && host !== "player.vimeo.com") {
      return null;
    }

    const match = parsed.pathname.match(/\/(?:video\/)?(\d+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

/** 16:9 crop without letterboxing (hqdefault is 4:3 with black bars for widescreen videos). */
const YOUTUBE_THUMBNAIL_VARIANT = "mqdefault";

export function getVideoThumbnailUrl(contentUrl: string): string | null {
  const youtubeId = extractYouTubeId(contentUrl);
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/${YOUTUBE_THUMBNAIL_VARIANT}.jpg`;
  }

  const vimeoId = extractVimeoId(contentUrl);
  if (vimeoId) {
    return `https://vumbnail.com/${vimeoId}.jpg`;
  }

  return null;
}

export function resolveCourseThumbnailUrl(
  contentUrl: string | null | undefined,
  fallbackImage: string,
): string {
  if (!contentUrl) {
    return fallbackImage;
  }

  return getVideoThumbnailUrl(contentUrl) ?? fallbackImage;
}
