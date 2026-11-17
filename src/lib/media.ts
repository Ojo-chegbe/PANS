type ImageSize = {
  url?: string | null;
  width?: number | null;
  height?: number | null;
};

export type PublicImage = ImageSize & {
  alt?: string | null;
  sizes?: { card?: ImageSize; thumbnail?: ImageSize };
};

// Payload may have generated an absolute URL using an old deployment origin.
// Keep app-owned media on the visitor's current origin, including previews.
export function mediaPath(value: string): string {
  try {
    const url = new URL(value, "https://media.invalid");
    if (/^\/api\/(media|files)\/file\//.test(url.pathname))
      return url.pathname + url.search;
  } catch {
    return "";
  }
  return value;
}

export function mediaURL(media: any, fallback = "") {
  const url =
    media && typeof media === "object"
      ? media.sizes?.card?.url || media.url || fallback
      : fallback;
  return mediaPath(url);
}

export function imageSources(image?: PublicImage | null, original = false) {
  const preferred = original
    ? image
    : image?.sizes?.card?.url
      ? image.sizes.card
      : image;
  const candidates = [image?.sizes?.thumbnail, image?.sizes?.card, image]
    .filter((size): size is ImageSize & { url: string; width: number } =>
      Boolean(size?.url && size.width && size.width > 0),
    )
    .sort((a, b) => a.width - b.width)
    .filter((size, i, all) => i === 0 || size.width !== all[i - 1].width);
  return {
    src: mediaPath(preferred?.url || image?.url || ""),
    srcSet:
      candidates.length > 1
        ? candidates
            .map((size) => `${mediaPath(size.url)} ${size.width}w`)
            .join(", ")
        : undefined,
    width: preferred?.width || undefined,
    height: preferred?.height || undefined,
  };
}

// Only the media collection is public. Never apply this to protected files.
export function publicMediaHeaders({ headers }: { headers: Headers }) {
  headers.set(
    "Cache-Control",
    "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
  );
  return headers;
}
