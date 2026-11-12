import { existsSync } from "node:fs";
import { shutdown } from "./shutdown";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
if (!process.env.DATABASE_URL)
  throw new Error("DATABASE_URL is required for PostgreSQL migrations.");
// Schema migrations and backup/restore use a direct connection, not PgBouncer.
if (process.env.DATABASE_URL_UNPOOLED)
  process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
process.env.PAYLOAD_MIGRATING = "true";
const { getPayload } = await import("payload");
const config = (await import("../src/payload.config")).default;
const payload = await getPayload({ config, disableOnInit: true });
try {
  await payload.db.migrate();
} finally {
  await shutdown(payload);
}
