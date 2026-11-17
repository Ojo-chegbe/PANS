import type { ImgHTMLAttributes } from "react";
import { imageSources, type PublicImage } from "@/lib/media";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & {
  image?: PublicImage | null;
  original?: boolean;
};

export function MediaImage({
  image,
  original = false,
  alt,
  loading = "lazy",
  sizes = "(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 430px",
  ...props
}: Props) {
  const sources = imageSources(image, original);
  if (!sources.src) return null;
  return (
    <img
      {...sources}
      alt={alt ?? image?.alt ?? ""}
      loading={loading}
      decoding="async"
      sizes={sources.srcSet ? sizes : undefined}
      {...props}
    />
  );
}
