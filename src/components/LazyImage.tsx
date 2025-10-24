import { useEffect, useRef, useState } from "react";
import { imgUrl } from "@/utils/img";

type Props = {
  src: string;
  alt: string;
  className?: string;
  aspect?: "square" | "video" | "portrait";
  fit?: "cover" | "contain";
  widths?: number[];
  sizes?: string;
  eager?: boolean;
};

export default function LazyImage({
  src,
  alt,
  className = "",
  aspect = "square",
  fit = "cover",
  widths = [240, 360, 480, 720],
  sizes = "(min-width: 1024px) 320px, 45vw",
  eager = false
}: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const [inView, setInView] = useState(eager);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (inView || eager) return;
    const el = ref.current;
    if (!el) return;
    
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px" }
    );
    
    io.observe(el);
    return () => io.disconnect();
  }, [eager, inView]);

  const ratioClass =
    aspect === "video"
      ? "aspect-video"
      : aspect === "portrait"
      ? "aspect-[3/4]"
      : "aspect-square";

  const srcSet = inView
    ? widths.map((w) => `${imgUrl(src, w, undefined, fit)} ${w}w`).join(", ")
    : undefined;

  const displaySrc = inView
    ? imgUrl(src, widths[Math.floor(widths.length / 2)], undefined, fit)
    : undefined;

  return (
    <div className={`${ratioClass} relative overflow-hidden rounded-xl ${className}`}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
      <img
        ref={ref}
        src={displaySrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        className={`h-full w-full object-${fit} ${
          loaded ? "opacity-100" : "opacity-0"
        } transition-opacity duration-300`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
