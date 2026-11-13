import path from "node:path";
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import sharp from "sharp";
import { allCollections } from "./cms/collections";
import { Home, Settings } from "./cms/globals";
import { emailAdapter } from "./lib/email";
import { isLocalPreview } from "./lib/environment";
import { postgresConnection } from "./lib/database";
import { staff, administrator, nobody } from "./lib/access";
import { isStaff, type Actor } from "./lib/domain";
if (
  existsSync(".env.local") &&
  !process.env.DATABASE_URL &&
  !process.env.SQLITE_URL
)
  process.loadEnvFile(".env.local");
const secretPath = path.resolve(".data/local-secret");
// Hosted runtimes have a read-only application directory. Only local development
// may create a fallback secret; hosted environments must supply a stable secret.
if (!process.env.PAYLOAD_SECRET) {
  if (process.env.NODE_ENV === "production" && !isLocalPreview())
    throw new Error(
      "Set PAYLOAD_SECRET before building or starting the hosted app.",
    );
  mkdirSync(path.dirname(secretPath), { recursive: true });
  if (!existsSync(secretPath))
    writeFileSync(secretPath, randomBytes(48).toString("hex"));
}
const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
if (
  process.env.NODE_ENV === "production" &&
  !isLocalPreview() &&
  process.env.NEXT_PHASE !== "phase-production-build" &&
  (!process.env.PAYLOAD_SECRET ||
    !process.env.DATABASE_URL ||
    !process.env.S3_BUCKET)
)
  throw new Error(
    "Production requires PAYLOAD_SECRET, DATABASE_URL and S3_BUCKET. See .env.example.",
  );
export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || readFileSync(secretPath, "utf8"),
  serverURL,
  csrf: [serverURL],
  cors: [serverURL],
  admin: {
    user: "users",
    importMap: { baseDir: path.resolve("src") },
    meta: { titleSuffix: " — PANS Administration" },
    components: {
      beforeLogin: [
        "/components/admin/LoginPasswordVisibility#LoginPasswordVisibility",
      ],
      graphics: {
        Logo: "/components/admin/Brand#AdminBrand",
        Icon: "/components/admin/Brand#AdminIcon",
      },
      beforeDashboard: ["/components/admin/Overview#AdminOverview"],
    },
  },
  collections: allCollections,
  globals: [Home, Settings],
  editor: lexicalEditor(),
  sharp,
  email: emailAdapter,
  db: process.env.DATABASE_URL
    ? postgresAdapter({
        ...postgresConnection(process.env.DATABASE_URL),
        migrationDir: path.resolve("src/migrations/postgres"),
      })
    : sqliteAdapter({
        client: { url: process.env.SQLITE_URL || "file:./.data/pans.db" },
        transactionOptions: {},
        migrationDir: path.resolve("src/migrations/sqlite"),
      }),
  typescript: { outputFile: path.resolve("src/payload-types.ts") },
  upload: { limits: { fileSize: 50 * 1024 * 1024 } },
  plugins: [
    s3Storage({
      enabled: Boolean(process.env.S3_BUCKET),
      alwaysInsertFields: true,
      bucket: process.env.S3_BUCKET || "pans",
      // Upload bytes go browser -> R2 rather than through a Vercel Function.
      clientUploads: {
        access: ({ req }) =>
          isStaff(req.user as Actor | null) ||
          Boolean((req.user as Actor | null)?.roles?.includes("contributor")),
      },
      collections: {
        media: { prefix: "media", signedDownloads: { expiresIn: 900 } },
        files: { prefix: "files", signedDownloads: { expiresIn: 7200 } },
      },
      config: {
        region: process.env.S3_REGION || "auto",
        endpoint: process.env.S3_ENDPOINT || undefined,
        forcePathStyle: Boolean(process.env.S3_ENDPOINT),
        credentials: process.env.S3_ACCESS_KEY_ID
          ? {
              accessKeyId: process.env.S3_ACCESS_KEY_ID,
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
            }
          : undefined,
      },
    }),
  ],
  jobs: {
    jobsCollectionOverrides: ({ defaultJobsCollection }) => ({
      ...defaultJobsCollection,
      admin: {
        ...defaultJobsCollection.admin,
        hidden: false,
        group: "Administration",
      },
      access: {
        read: staff,
        create: nobody,
        update: nobody,
        delete: administrator,
      },
    }),
    access: {
      run: ({ req }) =>
        isStaff(req.user as Actor | null) ||
        Boolean(
          process.env.JOBS_SECRET &&
          req.headers.get("authorization") ===
            "Bearer " + process.env.JOBS_SECRET,
        ),
    },
    tasks: [
      {
        slug: "send-notification",
        retries: 5,
        inputSchema: [
          { name: "to", type: "email", required: true },
          { name: "subject", type: "text", required: true },
          { name: "text", type: "textarea", required: true },
        ],
        handler: async ({ input, req }) => {
          await req.payload.sendEmail({
            to: String(input.to),
            subject: String(input.subject),
            text: String(input.text),
          });
          return { output: {} };
        },
      },
    ],
  },
});
