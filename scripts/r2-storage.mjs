/** Connect R2 without activating it in Payload until the existing uploads are copied. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { setDefaultResultOrder } from "node:dns";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";
import {
  S3Client,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Prefer the working IPv4 route on development networks without IPv6 connectivity.
setDefaultResultOrder("ipv4first");

const command = process.argv[2];
assert.ok(
  ["check", "copy"].includes(command),
  "Use: npm run storage:r2 -- check|copy",
);
const current = existsSync(".env.local")
  ? parseEnv(readFileSync(".env.local", "utf8"))
  : {};
const env = { ...current, ...process.env };
env.S3_BUCKET ||= "pans-digital-hub";
env.S3_ENDPOINT ||=
  "https://1df319619a499371d919b9b131cca215.r2.cloudflarestorage.com";
for (const name of [
  "S3_BUCKET",
  "S3_ENDPOINT",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
])
  assert.ok(
    env[name]?.trim(),
    `Set ${name} in .env.local first. Do not paste credentials into chat.`,
  );
const endpoint = new URL(env.S3_ENDPOINT);
assert.equal(endpoint.protocol, "https:");
assert.match(endpoint.hostname, /^[a-f\d]{32}\.r2\.cloudflarestorage\.com$/);
const client = new S3Client({
  region: "auto",
  endpoint: endpoint.origin,
  forcePathStyle: true,
  maxAttempts: 5,
  requestHandler: {
    connectionTimeout: 10000,
    requestTimeout: 30000,
    httpsAgent: { family: 4, keepAlive: false },
  },
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});
const Bucket = env.S3_BUCKET;
const origin = new URL(env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000")
  .origin;
const mime = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".mp3": "audio/mpeg",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

try {
  if (command === "check") {
    const Key = `_connection-check/${crypto.randomUUID()}`;
    const body = Buffer.alloc(6 * 1024 * 1024, 97);
    try {
      const url = await getSignedUrl(
        client,
        new PutObjectCommand({
          Bucket,
          Key,
          ContentType: "application/octet-stream",
          ContentLength: body.length,
          IfNoneMatch: "*",
        }),
        {
          expiresIn: 600,
          signableHeaders: new Set(["content-type", "content-length"]),
        },
      );
      const upload = await fetch(url, {
        method: "PUT",
        body,
        headers: {
          Origin: origin,
          "Content-Type": "application/octet-stream",
          "If-None-Match": "*",
        },
        signal: AbortSignal.timeout(120000),
      });
      assert.ok(upload.ok, `Direct upload returned HTTP ${upload.status}`);
      assert.equal(
        upload.headers.get("access-control-allow-origin"),
        origin,
        "Configure bucket CORS for the app origin.",
      );
      console.log(
        "PASS: Signed 6 MiB upload goes directly to R2; origin is allowed by CORS.",
      );
      const readURL = await getSignedUrl(
        client,
        new (await import("@aws-sdk/client-s3")).GetObjectCommand({
          Bucket,
          Key,
        }),
        { expiresIn: 60 },
      );
      const download = await fetch(readURL, {
        headers: { Range: "bytes=0-31" },
        signal: AbortSignal.timeout(30000),
      });
      assert.equal(download.status, 206);
      assert.equal((await download.arrayBuffer()).byteLength, 32);
      console.log(
        "PASS: Signed download supports byte ranges for video seeking.",
      );
      const anonymous = await fetch(
        endpoint.origin + "/" + Bucket + "/" + Key,
        { signal: AbortSignal.timeout(30000) },
      );
      const denial = await anonymous.text();
      assert.ok(
        [401, 403].includes(anonymous.status) ||
          (anonymous.status === 400 &&
            /<Code>InvalidArgument<\/Code>/.test(denial)),
        `Unsigned request returned HTTP ${anonymous.status}`,
      );
      console.log(
        "PASS: Unsigned S3 access is denied. Keep r2.dev and public custom domains disabled too.",
      );
    } finally {
      await client.send(new DeleteObjectCommand({ Bucket, Key }));
    }
    console.log("PASS: Temporary check object deleted.");
  } else {
    const manifest = [];
    // Copy originals and generated thumbnails. Keep every local source file.
    // Existing records without an object key resolve to collection/filename.
    for (const collection of ["media", "files"]) {
      const directory = path.resolve(".data", collection);
      if (!existsSync(directory)) continue;
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        if (!entry.isFile() || entry.name.startsWith(".")) continue;
        const body = readFileSync(path.join(directory, entry.name));
        const sha256 = createHash("sha256").update(body).digest("hex");
        const Key = `${collection}/${entry.name}`;
        let existing;
        try {
          existing = await client.send(new HeadObjectCommand({ Bucket, Key }));
        } catch (error) {
          if (error.$metadata?.httpStatusCode !== 404) throw error;
        }
        if (existing) {
          assert.equal(
            existing.ContentLength,
            body.length,
            `Refusing to overwrite different R2 object: ${Key}`,
          );
          assert.equal(
            existing.Metadata?.sha256,
            sha256,
            `Refusing to overwrite unverified R2 object: ${Key}`,
          );
        } else {
          await client.send(
            new PutObjectCommand({
              Bucket,
              Key,
              Body: body,
              IfNoneMatch: "*",
              ContentType:
                mime[path.extname(entry.name).toLowerCase()] ||
                "application/octet-stream",
              Metadata: { sha256 },
            }),
          );
          const stored = await client.send(
            new HeadObjectCommand({ Bucket, Key }),
          );
          assert.equal(stored.ContentLength, body.length);
          assert.equal(stored.Metadata?.sha256, sha256);
        }
        manifest.push({ key: Key, bytes: body.length, sha256 });
        if (manifest.length % 10 === 0)
          console.log(`Copied/verified ${manifest.length} objects...`);
      }
    }
    assert.ok(
      manifest.length,
      "No local uploads found; refusing to report a successful migration.",
    );
    writeFileSync(
      ".data/r2-copy-manifest.json",
      JSON.stringify(
        {
          bucket: Bucket,
          copiedAt: new Date().toISOString(),
          objects: manifest,
        },
        null,
        2,
      ),
    );
    console.log(
      `PASS: ${manifest.length} local objects copied/verified in R2. Local files retained. Manifest: .data/r2-copy-manifest.json`,
    );
    console.log(
      "This copies files only. Apply the versioned database migration before activating S3_BUCKET in .env.local.",
    );
  }
} finally {
  client.destroy();
}
