"use client";
import { Gutter, useAuth, useField } from "@payloadcms/ui";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import {
  VIDEO_MAX_BYTES,
  type VideoSession,
  type VideoUploadStatus,
} from "@/lib/video-upload-shared";

type SavedUpload = VideoSession & { label: string };
type SavedFile = { id: number | string; label: string };
type Phase = "idle" | "uploading" | "paused" | "finishing" | "ready";
class UploadError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
async function api<T>(data: object): Promise<T> {
  const response = await fetch("/api/video-upload", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(65000),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new UploadError(
      result.message || "The upload service is unavailable. Please retry.",
      response.status,
    );
  return result;
}
const formatSize = (bytes: number) =>
  bytes >= 1024 ** 3
    ? `${(bytes / 1024 ** 3).toFixed(2)} GB`
    : `${(bytes / 1024 ** 2).toFixed(1)} MB`;
async function fingerprint(file: File) {
  const chunks: BlobPart[] = [
    `${file.name}:${file.size}:${file.lastModified}:`,
  ];
  for (const fraction of [0, 0.25, 0.5, 0.75, 1]) {
    const start = Math.max(0, Math.floor((file.size - 65536) * fraction));
    chunks.push(await file.slice(start, start + 65536).arrayBuffer());
  }
  const digest = await crypto.subtle.digest(
    "SHA-256",
    await new Blob(chunks).arrayBuffer(),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
export function VideoUpload({
  onComplete,
}: {
  onComplete?: (file: SavedFile) => void;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const id = useId();
  const key = user ? `pans-video-upload-v1:${user.id}` : "";
  const [session, setSession] = useState<SavedUpload | null>(null);
  const [selected, setSelected] = useState<File | null>(null);
  const [label, setLabel] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [bytes, setBytes] = useState(0);
  const [message, setMessage] = useState("");
  const [storageWarning, setStorageWarning] = useState("");
  const [result, setResult] = useState<SavedFile | null>(null);
  const [ready, setReady] = useState(false);
  const completedBytes = useRef(0);
  const running = useRef(false);
  const pause = useRef(false);
  const mounted = useRef(true);
  const xhr = useRef<XMLHttpRequest | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const active = phase === "uploading" || phase === "finishing";
  useEffect(() => {
    mounted.current = true;
    if (!key) return;
    try {
      const value = localStorage.getItem(key);
      if (value) {
        const saved = JSON.parse(value) as SavedUpload;
        if (
          saved.expiresAt > Date.now() &&
          saved.token &&
          saved.partSize > 0 &&
          saved.size <= VIDEO_MAX_BYTES
        ) {
          setSession(saved);
          setLabel(saved.label);
          setPhase("paused");
          setMessage(
            "An unfinished upload is saved. Resume to check its progress; select the same file again if needed.",
          );
        } else {
          localStorage.removeItem(key);
          setMessage(
            "The previous upload expired. Choose your video to start again.",
          );
        }
      }
    } catch {
      setStorageWarning(
        "This browser cannot save upload progress across page refreshes. Keep this page open.",
      );
    }
    setReady(true);
    return () => {
      mounted.current = false;
      pause.current = true;
      xhr.current?.abort();
    };
  }, [key]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (running.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  function persist(value: SavedUpload | null) {
    setSession(value);
    try {
      if (value) localStorage.setItem(key, JSON.stringify(value));
      else localStorage.removeItem(key);
    } catch {
      setStorageWarning(
        "Keep this page open: this browser cannot save the resume reference.",
      );
    }
  }
  function saved(file: SavedFile) {
    persist(null);
    setBytes(0);
    setSelected(null);
    setResult(file);
    setPhase("ready");
    setMessage("Video uploaded and saved privately.");
    if (fileInput.current) fileInput.current.value = "";
    if (onComplete) onComplete(file);
    else router.refresh();
  }
  async function run() {
    if (running.current || !key) return;
    running.current = true;
    pause.current = false;
    setMessage("");
    setResult(null);
    setPhase("uploading");
    let current = session;
    try {
      if (!current) {
        if (!selected) throw new Error("Choose an MP4 video first.");
        const started = await api<VideoSession>({
          action: "start",
          filename: selected.name,
          size: selected.size,
          fingerprint: await fingerprint(selected),
        });
        current = {
          ...started,
          label: label.trim() || selected.name.replace(/\.mp4$/i, ""),
        };
        persist(current);
      }
      const status = await api<VideoUploadStatus>({
        action: "status",
        token: current.token,
      });
      if (status.file) {
        saved(status.file);
        return;
      }
      const parts = new Set(status.parts.map((part) => part.number));
      let completed = status.parts.reduce((sum, part) => sum + part.size, 0);
      completedBytes.current = completed;
      setBytes(completed);
      if (!status.assembled && completed < current.size) {
        if (!selected)
          throw new Error(
            "Select the same video file, then resume. Completed parts will be kept.",
          );
        if (
          selected.size !== current.size ||
          (await fingerprint(selected)) !== current.fingerprint
        )
          throw new Error(
            "This is a different video. Select the original file, or discard this upload to start another.",
          );
        for (
          let number = 1;
          number <= Math.ceil(current.size / current.partSize);
          number++
        ) {
          if (pause.current) throw new DOMException("Paused", "AbortError");
          if (parts.has(number)) continue;
          const part = selected.slice(
            (number - 1) * current.partSize,
            Math.min(number * current.partSize, current.size),
          );
          let uploaded = false;
          for (let attempt = 0; attempt < 3 && !uploaded; attempt++) {
            if (pause.current) throw new DOMException("Paused", "AbortError");
            try {
              const signed = await api<{ parts: { url: string }[] }>({
                action: "parts",
                token: current.token,
                numbers: [number],
              });
              if (pause.current) throw new DOMException("Paused", "AbortError");
              await new Promise<void>((resolve, reject) => {
                const request = new XMLHttpRequest();
                xhr.current = request;
                request.open("PUT", signed.parts[0].url);
                request.timeout = 15 * 60_000;
                request.upload.onprogress = (event) => {
                  if (mounted.current) setBytes(completed + event.loaded);
                };
                request.onload = () =>
                  request.status >= 200 && request.status < 300
                    ? resolve()
                    : reject(new Error("A video part could not be uploaded."));
                request.onerror = () =>
                  reject(
                    new Error(
                      "Connection interrupted. Your completed parts are saved; resume when connected.",
                    ),
                  );
                request.ontimeout = () =>
                  reject(
                    new Error(
                      "The connection timed out. Resume to continue from the saved parts.",
                    ),
                  );
                request.onabort = () =>
                  reject(new DOMException("Paused", "AbortError"));
                request.send(part);
              });
              uploaded = true;
            } catch (error) {
              if (
                pause.current ||
                attempt === 2 ||
                (error instanceof UploadError && error.status < 500)
              )
                throw error;
              setMessage("Connection interrupted. Retrying this part…");
              await new Promise((resolve) =>
                setTimeout(resolve, 1000 * 2 ** attempt),
              );
            }
          }
          completed += part.size;
          completedBytes.current = completed;
          setBytes(completed);
          setMessage("");
        }
      }
      if (pause.current) throw new DOMException("Paused", "AbortError");
      setPhase("finishing");
      setMessage("Checking and saving your video…");
      const complete = await api<{ file: SavedFile }>({
        action: "complete",
        token: current.token,
        label: label.trim() || current.label,
      });
      if (mounted.current) saved(complete.file);
    } catch (error) {
      if (!mounted.current) return;
      setBytes(completedBytes.current);
      if (error instanceof UploadError && [410, 422].includes(error.status)) {
        persist(null);
        setPhase("idle");
        setBytes(0);
      } else setPhase(current ? "paused" : "idle");
      setMessage(
        pause.current
          ? "Paused. Completed parts are saved. Resume whenever you are ready."
          : error instanceof Error
            ? error.message
            : "Upload interrupted. Please resume.",
      );
    } finally {
      running.current = false;
      xhr.current = null;
    }
  }
  async function discard() {
    if (!session || phase === "finishing") return;
    pause.current = true;
    xhr.current?.abort();
    setPhase("finishing");
    setMessage("Discarding the unfinished upload…");
    try {
      await api({ action: "abort", token: session.token });
      persist(null);
      setSelected(null);
      setBytes(0);
      setLabel("");
      setPhase("idle");
      setMessage("Unfinished upload discarded.");
      if (fileInput.current) fileInput.current.value = "";
    } catch (error) {
      if (error instanceof UploadError && error.status === 410) {
        persist(null);
        setPhase("idle");
        setMessage("The expired upload has been cleared.");
      } else {
        setPhase("paused");
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not discard. Please retry.",
        );
      }
    }
  }
  if (!user) return null;
  const content = (
    <section className="pans-video-upload" aria-labelledby={id + "-title"}>
      <h3 id={id + "-title"}>Upload a course video</h3>
      <p>
        MP4, up to 20 GB per video. Pause and resume without losing completed
        parts.
      </p>
      <label htmlFor={id + "-label"}>Video title</label>
      <input
        id={id + "-label"}
        type="text"
        value={label}
        maxLength={200}
        disabled={!ready || active}
        onChange={(event) => setLabel(event.target.value)}
      />
      <label htmlFor={id + "-file"}>
        {session ? "Select the original video to resume" : "Choose your video"}
      </label>
      <input
        ref={fileInput}
        id={id + "-file"}
        type="file"
        accept="video/mp4,.mp4"
        disabled={!ready || active}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          if (
            !/\.mp4$/i.test(file.name) ||
            file.size < 32 ||
            file.size > VIDEO_MAX_BYTES
          ) {
            setMessage("Choose an MP4 video no larger than 20 GB.");
            event.target.value = "";
            return;
          }
          setSelected(file);
          setResult(null);
          setMessage("");
          if (!session) setLabel(file.name.replace(/\.mp4$/i, ""));
        }}
      />
      {session && (
        <p className="pans-video-upload__filename">
          {session.filename} · {formatSize(session.size)}
        </p>
      )}
      {(session || active) && (
        <div className="pans-video-upload__progress">
          <progress
            max={session?.size || selected?.size || 1}
            value={Math.min(bytes, session?.size || selected?.size || 1)}
            aria-label="Video upload progress"
          />
          <span>
            {formatSize(bytes)} of{" "}
            {formatSize(session?.size || selected?.size || 0)}
          </span>
        </div>
      )}
      <div className="pans-video-upload__actions">
        {!active && (
          <button
            type="button"
            onClick={run}
            disabled={!ready || (!session && !selected)}
          >
            {session ? "Resume upload" : "Upload video"}
          </button>
        )}
        {phase === "uploading" && (
          <button
            type="button"
            onClick={() => {
              pause.current = true;
              xhr.current?.abort();
            }}
          >
            Pause upload
          </button>
        )}
        {session && !active && (
          <button
            type="button"
            className="pans-video-upload__secondary"
            onClick={discard}
          >
            Discard upload
          </button>
        )}
        {phase === "finishing" && <span>Finishing…</span>}
      </div>
      <p role="status" aria-live="polite">
        {message}
      </p>
      {result && (
        <a href={`/admin/collections/files/${result.id}`}>View saved video</a>
      )}
      {storageWarning && <p>{storageWarning}</p>}
    </section>
  );
  return onComplete ? content : <Gutter>{content}</Gutter>;
}
export function LessonVideoUpload() {
  const { setValue } = useField<number | string>({ path: "videoFile" });
  return <VideoUpload onComplete={(file) => setValue(file.id)} />;
}
