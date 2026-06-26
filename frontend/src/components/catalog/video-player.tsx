type VideoPlayerProps = {
  src: string;
  title: string;
};

export function VideoPlayer({ src, title }: VideoPlayerProps) {
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
