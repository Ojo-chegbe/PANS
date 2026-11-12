# R2 setup result — 12 November 2026

R2 is connected and active in the app's existing `.env.local`. Credentials are server-only and excluded from deployment uploads and Git.

## Completed

- Created private Standard storage bucket `pans-digital-hub` and configured CORS for `http://localhost:3000`.
- Verified that public access through `r2.dev` is disabled.
- Enabled authenticated direct admin uploads and signed downloads through the existing Payload S3 adapter. Existing private-file authorization remains in place.
- Copied and verified **82 objects, 5,337,575 bytes**, including existing images and thumbnails. Every local original remains on disk. Copy manifest: `.data/r2-copy-manifest.json`.
- Checked every database-referenced image/thumbnail against the copied objects before activation. The database contained 23 media records and no protected-file records before the temporary verification upload.
- Added and applied migration `20261112_200624_r2_storage`: four additive metadata columns across media and files. Existing IDs and relationships were retained. The migration passed on the isolated Neon trial branch before application; that check was rolled back.
- Backed up the affected tables and migration history in `.data/backups/r2-metadata-1794515404871`, with the previous environment file. Existing file bytes remain backed up locally by retaining their source directories.
- Removed the unconditional application-directory write during hosted startup. Added `.vercelignore` to exclude local files, credentials and development artifacts.

## Verification

The production build passed, including TypeScript. Log: `.data/r2-build.log`.

The live R2 connection check passed:

```text
PASS: Signed 6 MiB upload goes directly to R2; origin is allowed by CORS.
PASS: Signed download supports byte ranges for video seeking.
PASS: Unsigned S3 access is denied.
PASS: Temporary check object deleted.
```

The app check passed against the production build running locally. Log: `.data/r2-app-check.log`.

```text
PASS: Homepage and existing image records load; images redirect to signed R2 URLs.
PASS: Anonymous callers cannot obtain upload permission.
PASS: Authenticated signed upload is saved in R2 and Neon, without a local file copy.
PASS: Private download is denied anonymously and works for the authorized admin through signed R2 delivery.
PASS: Temporary upload record and object deleted.
```

## Recovered issues and remaining work

- Local connection timeouts/reset errors interrupted initial checks and copying. IPv4 routing and bounded SDK retries resolved the helper connections; the copy resumed by verifying matching objects rather than overwriting them.
- `pg_dump` timed out twice and produced no usable full backup. The separate affected-table backup above succeeded before the migration. Do not treat the zero-byte dump attempts as backups.
- Payload displayed a generic development-schema warning because an old `dev` migration marker exists. The user authorized proceeding after the concrete additive migration and its backup were reviewed.
- The local development server hit a Webpack module-cache error. The app was switched to the successful production build for final verification. Local preview runs at `http://localhost:3000`, bound to loopback, with explicit local-preview mode. Hosting production checks were not loosened.
- **Updated:** course videos now have a separate 20 GiB resumable uploader with bounded validation and playback-link recovery. See [LARGE_VIDEO_UPLOADS.md](./LARGE_VIDEO_UPLOADS.md). The ordinary 50 MiB limit remains for images/documents; contributor-page document uploads still travel through the app backend and need a direct-upload conversion before exceeding Vercel's request-body limit.
- Vercel has not been deployed. Its exact origin must be added to bucket CORS, and the server-side environment variables must be configured there. Production email still needs a verified sender domain.

Operational details: [R2_STORAGE.md](./R2_STORAGE.md).
