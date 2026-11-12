import { existsSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { randomBytes } from "node:crypto";
import { shutdown } from "./shutdown";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const email = process.argv[2]?.trim().toLowerCase();
if (!email || !email.includes("@"))
  throw new Error("Usage: npm run admin:create -- your-email@example.com");
const { getPayload } = await import("payload");
const config = (await import("../src/payload.config")).default;
const payload = await getPayload({ config });
const existing = await payload.find({
  collection: "users",
  where: { email: { equals: email } },
  limit: 1,
  overrideAccess: true,
});
if (existing.docs[0]) {
  await payload.update({
    collection: "users",
    id: existing.docs[0].id,
    data: {
      roles: [
        ...new Set([...(existing.docs[0].roles || []), "admin" as const]),
      ],
      _verified: true,
    },
    overrideAccess: true,
    context: { system: true },
  });
  console.log(
    "Administrator access granted to the existing account. Its password was not changed.",
  );
} else {
  const password = randomBytes(24).toString("base64url");
  await payload.create({
    collection: "users",
    data: {
      name: "PANS Administrator",
      email,
      password,
      roles: ["admin"],
      _verified: true,
    },
    overrideAccess: true,
    context: { system: true },
  });
  const { writeFile, mkdir } = await import("node:fs/promises");
  await mkdir(".data", { recursive: true });
  await writeFile(
    ".data/admin-access.txt",
    "Email: " +
      email +
      "\nTemporary password: " +
      password +
      "\n\nSign in at /admin. Change this password after signing in.\n",
  );
  console.log(
    "Administrator created. Temporary credentials were saved to .data/admin-access.txt. No password was printed.",
  );
}
await shutdown(payload);
