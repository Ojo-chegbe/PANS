"use client";
import { useEffect, useRef, useState } from "react";
export function Gallery({ photos }: { photos: any[] }) {
  const track = useRef<HTMLDivElement>(null),
    dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0),
    [full, setFull] = useState(0);
  const go = (target: number) => {
    const next = Math.max(0, Math.min(photos.length - 1, target));
    setIndex(next);
    const slide = track.current?.children[next] as HTMLElement | undefined;
    if (slide)
      track.current!.scrollTo({
        left: slide.offsetLeft,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  };
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!dialog.current?.open) return;
      if (event.key === "ArrowLeft")
        setFull((current) => Math.max(0, current - 1));
      if (event.key === "ArrowRight")
        setFull((current) => Math.min(photos.length - 1, current + 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [photos.length]);
  if (!photos.length)
    return (
      <p className="empty-state">Community moments will appear here soon.</p>
    );
  const src = (photo: any) => photo.image?.url || "";
  return (
    <>
      <div className="marquee-wrap">
        <div
          ref={track}
          className="marquee-track"
          tabIndex={0}
          aria-label="Community photographs"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              go(index - 1);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              go(index + 1);
            }
          }}
          onScroll={() => {
            const el = track.current;
            if (!el) return;
            let nearest = 0;
            Array.from(el.children).forEach((child, i) => {
              if (
                Math.abs((child as HTMLElement).offsetLeft - el.scrollLeft) <
                Math.abs(
                  (el.children[nearest] as HTMLElement).offsetLeft -
                    el.scrollLeft,
                )
              )
                nearest = i;
            });
            if (
              el.scrollLeft > 0 &&
              el.scrollWidth - el.clientWidth - el.scrollLeft < 2
            )
              nearest = photos.length - 1;
            setIndex(nearest);
          }}
        >
          {photos.map((photo, i) => (
            <button
              type="button"
              className="marquee-item"
              key={photo.id}
              aria-label={"Open " + photo.caption}
              onClick={() => {
                setFull(i);
                dialog.current?.showModal();
              }}
            >
              <img
                src={src(photo)}
                alt={photo.image?.alt || photo.caption}
                loading="lazy"
              />
              <span className="gallery-slide-number">
                {String(i + 1).padStart(2, "0")} / {photos.length}
              </span>
              <span className="marquee-caption">{photo.caption}</span>
            </button>
          ))}
        </div>
        <div className="gallery-toolbar">
          <div className="gallery-counter">
            <strong>{String(index + 1).padStart(2, "0")}</strong> /{" "}
            {photos.length}
          </div>
          <div
            className="gallery-indicators"
            role="group"
            aria-label="Choose a photograph"
          >
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                aria-label={"Photograph " + (i + 1)}
                aria-current={index === i ? "true" : undefined}
                onClick={() => go(i)}
              />
            ))}
          </div>
          <div className="gallery-arrows">
            <button
              disabled={index === 0}
              aria-label="Previous photograph"
              onClick={() => go(index - 1)}
            >
              ←
            </button>
            <button
              disabled={index === photos.length - 1}
              aria-label="Next photograph"
              onClick={() => go(index + 1)}
            >
              →
            </button>
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {index + 1} of {photos.length}: {photos[index].caption}
        </p>
      </div>
      <dialog
        ref={dialog}
        className="lightbox"
        aria-label="Community photograph"
      >
        <div className="lightbox-toolbar">
          <span>
            {full + 1} / {photos.length}
          </span>
          <button
            className="text-button"
            onClick={() => dialog.current?.close()}
          >
            Close
          </button>
        </div>
        <img
          src={src(photos[full])}
          alt={photos[full].image?.alt || photos[full].caption}
        />
        <div className="lightbox-toolbar">
          <button
            className="text-button"
            disabled={full === 0}
            onClick={() => setFull(full - 1)}
          >
            Previous
          </button>
          <p>{photos[full].caption}</p>
          <button
            className="text-button"
            disabled={full === photos.length - 1}
            onClick={() => setFull(full + 1)}
          >
            Next
          </button>
        </div>
      </dialog>
    </>
  );
}
