"use client";
import { useEffect, useRef, useState } from "react";

/** Reload the access-checked app URL to renew an expired R2 playback link. */
export function CourseVideo({
  source,
  poster,
  refreshable,
}: {
  source: string;
  poster?: string;
  refreshable: boolean;
}) {
  const [src, setSrc] = useState(source);
  const [message, setMessage] = useState("");
  const video = useRef<HTMLVideoElement | null>(null);
  const pending = useRef<{ position: number; playing: boolean } | null>(null);
  const automaticRetry = useRef(false);
  const loadedAt = useRef(Date.now());
  const wasPlaying = useRef(false);
  const lastPosition = useRef(0);
  useEffect(() => {
    setSrc(source);
    automaticRetry.current = false;
    pending.current = null;
    loadedAt.current = Date.now();
    wasPlaying.current = false;
    lastPosition.current = 0;
    setMessage("");
  }, [source]);
  function renew() {
    const player = video.current;
    if (!player) return;
    pending.current = {
      position: player.error
        ? lastPosition.current
        : Number.isFinite(player.currentTime)
          ? player.currentTime
          : lastPosition.current,
      playing: wasPlaying.current,
    };
    setMessage("Reconnecting to your video…");
    if (refreshable) {
      const url = new URL(source, window.location.origin);
      url.searchParams.set("playback", String(Date.now()));
      setSrc(url.href);
    } else player.load();
  }
  return (
    <>
      <video
        ref={video}
        className="lesson-video"
        controls
        playsInline
        controlsList="nodownload"
        preload="metadata"
        src={src}
        poster={poster}
        onPlay={() => {
          wasPlaying.current = true;
          if (
            refreshable &&
            Date.now() - loadedAt.current > 105 * 60_000 &&
            !pending.current
          )
            renew();
        }}
        onPause={() => {
          if (!video.current?.error && !pending.current)
            wasPlaying.current = false;
        }}
        onEnded={() => {
          wasPlaying.current = false;
        }}
        onTimeUpdate={() => {
          if (video.current && !video.current.error)
            lastPosition.current = video.current.currentTime;
        }}
        onLoadedMetadata={() => {
          const player = video.current;
          const resume = pending.current;
          loadedAt.current = Date.now();
          pending.current = null;
          setMessage("");
          if (player && resume) {
            player.currentTime = Math.min(
              resume.position,
              Number.isFinite(player.duration)
                ? Math.max(0, player.duration - 0.1)
                : resume.position,
            );
            if (resume.playing)
              void player
                .play()
                .catch(() => setMessage("Press play to continue."));
          }
        }}
        onError={() => {
          if (
            refreshable &&
            !automaticRetry.current &&
            video.current?.error?.code !== 3
          ) {
            automaticRetry.current = true;
            renew();
          } else {
            pending.current = null;
            setMessage(
              video.current?.error?.code === 3
                ? "This browser cannot play this video. Try another browser or contact the course team."
                : "The video could not be loaded. Check your connection and sign in again if your session has expired.",
            );
          }
        }}
      />
      {message && (
        <p className="form-note" role="status">
          {message}{" "}
          {!pending.current && (
            <button
              type="button"
              className="quiet-link"
              onClick={() => {
                automaticRetry.current = false;
                renew();
              }}
            >
              Try again
            </button>
          )}
        </p>
      )}
    </>
  );
}
