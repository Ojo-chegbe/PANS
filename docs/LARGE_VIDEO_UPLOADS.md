# Large course videos

Course videos have a separate resumable uploader supporting **MP4 files up to 20 GiB each**. The existing 50 MiB limit still applies to ordinary image/document uploads; it does not apply to this video flow.

## Use it

Open **Files → Files** in administration and use **Upload a course video**, or use the same uploader while editing a lesson. On a lesson, completion selects the saved video automatically; save the lesson to retain that selection.

The uploader shows progress and has Pause, Resume and Discard controls. After a refresh, sign in with the same account in the same browser, select the original video again and resume. The browser keeps a resume reference, not a copy of the video. Closing the browser does not erase successfully uploaded parts. Resume references last six days; Cloudflare's default rule aborts unfinished multipart uploads after seven days. Clearing browser storage loses the local resume reference.

Uploads do not recompress or re-encode the video. Exporting H.264 MP4 with AAC audio gives broad browser compatibility. This flow does not provide adaptive bitrate streaming or DRM.

## Transfer and validation

- The browser uploads uniform 16 MiB parts directly to private R2 storage. The last part can be smaller. Each request for permission signs only specific part numbers and byte lengths; fresh links are obtained for retries.
- The backend handles small JSON control requests. It checks the current login, role and request origin. Signed upload references are bound to the account, filename, object key, size, upload ID and expiry.
- Resume reads R2's authoritative part list, including pagination. It never trusts client-supplied ETags or completed-byte claims. A sampled fingerprint detects accidental selection of a different source file.
- Completion checks all part numbers and sizes, then validates MP4 container structure and a video track using bounded range reads. It reads at most 32 KiB over at most 128 metadata requests, skipping the media payload. Structural checks do not constitute a full decode or antivirus scan.
- The validated object is registered directly in the existing Files collection. That metadata-only path requires a server-owned context flag; ordinary clients cannot create a file record without an upload or rewrite its storage coordinates.
- Completion is serialized by an advisory transaction lock and is idempotent. If the connection drops after assembly or saving, Resume checks the existing object/record and completes without uploading the video again. Transient validation/network failures preserve the assembled object for retry. Conclusively invalid containers are deleted.
- Discard aborts the multipart transfer and removes an assembled object that has not been registered. An already registered file must be deleted through Files; Discard cannot delete it. An assembled object whose database registration repeatedly fails should be completed or discarded before its resume reference expires; review R2 for abandoned completed objects after an unrecoverable database outage.

## Playback

Existing file permissions and course entitlements protect video access. Playback redirects to a two-hour R2 signed URL, with byte ranges for seeking. The course player renews access through the app after a stale link or playback network error, retaining position and attempting to continue playback. A revoked or expired login cannot obtain a fresh link. Anyone holding an existing signed URL can use it until expiry.

## Deployment

R2 bucket CORS must allow the exact app origin, `PUT`, `GET`, `HEAD`, `Content-Length`, `Content-Type`, `Range` and the applicable S3 headers. The current local policy is in `scripts/r2-cors.json`; add the Vercel origin before testing uploads there. No video bytes need to pass through a Vercel Function, and no disk file is created by video finalization.

No database schema migration is needed for this feature: it uses the R2 metadata fields already added during storage setup. The endpoint is `/api/video-upload` and requires the existing R2 and Payload environment variables.

Focused validation checks: `node --import tsx --test tests/video-upload.test.ts`.
