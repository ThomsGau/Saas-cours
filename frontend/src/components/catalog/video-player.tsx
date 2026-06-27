type VideoPlayerProps = {
  src: string;
  title: string;
};

function extractYouTubeId(url: string): string | null {
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

export function VideoPlayer({ src, title }: VideoPlayerProps) {
  const youtubeId = extractYouTubeId(src);

  if (youtubeId) {
    return (
      <div className="overflow-hidden rounded-lg shadow-soft">
        <iframe
          key={youtubeId}
          className="aspect-video w-full bg-foreground/5"
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg shadow-soft">
      <video
        key={src}
        controls
        className="aspect-video w-full bg-foreground/5"
        src={src}
        title={title}
      >
        Votre navigateur ne prend pas en charge la lecture vidéo.
      </video>
    </div>
  );
}
