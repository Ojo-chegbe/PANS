# Large-video flow verification

Implemented on 12 November 2026. Usage and architecture: [LARGE_VIDEO_UPLOADS.md](./LARGE_VIDEO_UPLOADS.md).

## Delivered

- MP4 videos up to 20 GiB, transferred in 16 MiB parts directly from the browser to private R2 storage.
- Progress, automatic part retries, pause/resume, refresh recovery, same-file checks and discard.
- Account-bound signed session references, origin/role checks, bounded MP4 container/video-track validation, and idempotent finalization under an advisory transaction lock.
- Metadata registration in Neon without reading the full video through Payload or writing it to local disk.
- Files-list and inline lesson upload interfaces using the existing admin styles. Inline completion selects the video and keeps other form edits intact.
- Playback-link recovery through the existing access-checked file endpoint, retaining position and attempting to continue playback.

## Evidence

Focused checks (`node --import tsx --test tests/video-upload.test.ts`): **4 passed**. They cover bounded validation of a synthetic 8 GiB layout, rejection of invalid/audio-only containers, exact part boundaries, and account/tamper/expiry protection.

The production build and TypeScript passed. Latest build log: `.data/video-build.log`.

The focused browser check passed with a generated, playable **67,117,706-byte MP4**:

```text
PASS: Browser uploads the first 16 MiB directly to R2; interruption and pause preserve that part.
PASS: Reloading the page restores the upload; reselecting the original file resumes only missing parts and saves the 64 MiB video.
PASS: Completion is idempotent; unsigned viewers are denied; the real MP4 plays in the browser at its original dimensions.
PASS: Temporary video record and uploaded file deleted.
```

After the refresh, only parts **2, 3, 4 and 5** were transferred; part 1 was retained. Browser playback decoded the original **640 × 360** video and advanced successfully. The browser reported no uncaught errors. Machine-readable result: `.data/video-upload-result.json`; log: `.data/video-browser-check.log`.

Inline lesson editing also passed:

```text
PASS: Uploading inside a lesson selects the video, saves it through normal draft autosave, and preserves other lesson edits.
PASS: Temporary lesson, course and video were removed.
```

Log: `.data/video-lesson-check.log`. Screenshots are saved locally in `.data/video-upload-browser.png` and `.data/video-lesson-uploader.png`.

The first browser check exposed an early file-selection/hydration issue; file selection is now disabled until the uploader is ready. A subsequent metadata assertion omitted the origin header required for non-browser cookie-authenticated requests; the verification request was corrected without weakening application authentication.

## Practical limits

The live test used about 64 MiB; a physical 20 GiB transfer was not performed. Large-offset validation was checked without allocating or downloading an 8 GiB video. The 20 GiB cap is the implemented application limit.

This is original-file MP4 delivery, without transcoding, adaptive bitrate streaming or DRM. Ordinary image/document and contributor-upload limits are unchanged. Vercel deployment and its exact CORS origin still need to be configured and verified separately.
