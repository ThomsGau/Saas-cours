import { extractYouTubeId } from "@/lib/video/video-url";

type VideoPlayerProps = {
  src: string;
  title: string;
};

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
