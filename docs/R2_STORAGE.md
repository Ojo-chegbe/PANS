# Cloudflare R2 storage

The app uses the private `pans-digital-hub` R2 bucket through Payload's S3 adapter. Neon continues to store users, content, purchases and file metadata. R2 stores the file bytes.

## Configuration

Keep these settings in `.env.local` for local development and in the hosting provider's server-side environment settings for deployment:

```env
S3_BUCKET=pans-digital-hub
S3_REGION=auto
S3_ENDPOINT=https://<cloudflare-account-id>.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=<bucket-scoped-access-key-id>
S3_SECRET_ACCESS_KEY=<secret-access-key>
```

Use an R2 token with Object Read & Write permission restricted to this bucket. Never prefix these variables with `NEXT_PUBLIC_` or commit credentials. Keep the bucket's r2.dev endpoint and public custom domains disabled.

## Access and delivery

- Public images use the `media/` object prefix and the app's public media read access.
- Course videos and downloads use the `files/` prefix. Payload checks the existing file permissions before redirecting an authorized viewer to a signed R2 URL.
- Signed image URLs last 15 minutes; signed protected-file URLs last two hours. Anyone holding a signed URL can use it until it expires, including after a permission change. This is temporary link access, not DRM.
- Admin uploads use Payload's signed direct-upload flow. The browser sends file bytes to R2, bypassing Vercel's request-body limit. Payload still validates files and processes image sizes on the server.
- Ordinary image/document uploads retain the **50 MiB** limit. Course videos use a separate **20 GiB resumable uploader** in Files and lesson editing, with bounded MP4 validation and playback-link renewal. See [LARGE_VIDEO_UPLOADS.md](./LARGE_VIDEO_UPLOADS.md). Actual Vercel deployment verification remains separate from local checks.

## CORS

`scripts/r2-cors.json` allows `http://localhost:3000`. Add the exact Vercel deployment origin before using its admin uploader. Keep allowed origins explicit; do not use a wildcard for every Vercel project. Apply the file with:

```sh
wrangler r2 bucket cors set pans-digital-hub --file scripts/r2-cors.json
```

## Initial migration

1. Keep `S3_BUCKET` empty while preparing the connection. Save the two keys in `.env.local`.
2. Apply the versioned `20261112_200624_r2_storage` migration with the normal database migration command. It adds `prefix` and `_objectKey` metadata to media and files; existing record IDs and relationships remain intact.
3. Run `npm run storage:r2 -- check` for one temporary signed upload, range download, unsigned-access denial and cleanup.
4. Run `npm run storage:r2 -- copy` to copy existing files and thumbnails from `.data/media` and `.data/files`. It retains local sources, refuses to overwrite different objects, verifies size and checksum metadata, and writes `.data/r2-copy-manifest.json`.
5. Set the bucket, endpoint and region in `.env.local`, restart the app and verify existing images and a protected upload through the app.

The copy helper defaults to this project's bucket and endpoint only while preparing the connection; the Payload runtime uses the explicit environment values above. The helper copies files rather than creating or replacing database records. Existing database records without an object key resolve to `media/filename` or `files/filename`; new direct uploads have a unique object folder.

## Hosting

Vercel must receive the S3 variables, the existing Payload secret, the pooled Neon database URL and the email configuration. Use the direct Neon URL for migrations. Set `NEXT_PUBLIC_SERVER_URL` to the deployment's actual HTTPS origin. Secrets must remain stable between deployments.

R2 is usage-billed beyond its free allowance. This setup does not establish a billing cap. The Vercel Hobby plan's commercial-use restrictions also remain relevant before launching paid course or product sales.

References: [Payload storage adapters](https://payloadcms.com/docs/upload/storage-adapters), [R2 signed URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/), [R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/), [Vercel upload limit](https://vercel.com/docs/errors/function_payload_too_large).
