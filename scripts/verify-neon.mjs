/** Focused live check: HTTP app operations must persist in the configured Neon DB. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import pg from "pg";
import { postgresConnection } from "../src/lib/database.ts";

const env = parseEnv(readFileSync(".env.local", "utf8"));
const url = new URL(env.DATABASE_URL);
assert.ok(
  url.hostname.endsWith(".neon.tech"),
  "This check requires the app's Neon database.",
);
const base = new URL(env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000")
  .origin;
assert.ok(
  ["localhost", "127.0.0.1"].includes(new URL(base).hostname),
  "Run this check against the local app only.",
);
const access = readFileSync(".data/admin-access.txt", "utf8");
const email = access.match(/Email: (.+)/)?.[1]?.trim();
const password = access.match(/Temporary password: (.+)/)?.[1]?.trim();
assert.ok(
  email && password,
  "Local administrator credentials are needed for the HTTP verification.",
);
const db = new pg.Client({ ...postgresConnection(env.DATABASE_URL).pool });
let token;
let productID;
async function api(route, method = "GET", data) {
  const response = await fetch(base + route, {
    method,
    headers: {
      Origin: base,
      "Content-Type": "application/json",
      ...(token ? { Authorization: `JWT ${token}` } : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
    signal: AbortSignal.timeout(60000),
  });
  assert.ok(
    response.ok,
    `${method} ${route.split("?")[0]} returned HTTP ${response.status}`,
  );
  return response.json();
}
try {
  await db.connect();
  assert.equal(db.connection.stream.encrypted, true);
  assert.equal(db.connection.stream.authorized, true);
  console.log(
    "PASS: Connected to Neon over verified TLS using the app's pooled PostgreSQL settings.",
  );
  await db.query("begin");
  try {
    await db.query("select pg_advisory_xact_lock($1, $2)", [148527, 263845]);
    await db.query("select 1");
  } finally {
    await db.query("rollback");
  }
  console.log(
    "PASS: Transaction-scoped advisory locks work through Neon's pooler.",
  );
  const home = await fetch(base, { signal: AbortSignal.timeout(60000) });
  assert.equal(home.status, 200);
  const html = await home.text();
  assert.ok(html.includes("PANS"));
  console.log("PASS: Running app homepage returns HTTP 200 with PANS content.");
  const login = await api("/api/users/login", "POST", { email, password });
  token = login.token;
  assert.ok(token);
  assert.ok(login.user.roles.includes("admin"));
  console.log(
    "PASS: Existing administrator can sign in through the app against Neon.",
  );
  const unique = Date.now();
  const created = await api("/api/products", "POST", {
    title: "Neon setup verification",
    slug: "neon-verification-" + unique,
    description:
      "Temporary unpublished product for database integration verification.",
    type: "physical",
    price: 100,
    stock: 0,
    salesOpen: false,
    reviewStatus: "draft",
    _status: "draft",
  });
  productID = created.doc.id;
  const inserted = await db.query("select title from products where id=$1", [
    productID,
  ]);
  assert.equal(inserted.rows[0].title, "Neon setup verification");
  await api(`/api/products/${productID}`, "PATCH", {
    title: "Neon verified write",
  });
  const record = await api(`/api/products/${productID}?depth=0&draft=true`);
  assert.equal(record.title, "Neon verified write");
  const persisted = await db.query("select title from products where id=$1", [
    productID,
  ]);
  assert.equal(persisted.rows[0].title, "Neon verified write");
  console.log(
    "PASS: Admin HTTP create/read/update persisted in Neon, confirmed over an independent database connection.",
  );
  await api(`/api/products/${productID}`, "DELETE");
  assert.equal(
    (
      await db.query(
        "select count(*)::int as count from products where id=$1",
        [productID],
      )
    ).rows[0].count,
    0,
  );
  productID = undefined;
  console.log(
    "PASS: Temporary product deleted; verification left no saleable test product.",
  );
} catch (error) {
  console.error(
    error instanceof assert.AssertionError
      ? error.message
      : `Neon verification failed (${error.code || error.name || "unknown"}).`,
  );
  process.exitCode = 1;
} finally {
  if (productID && token) {
    try {
      await api(`/api/products/${productID}`, "DELETE");
    } catch {
      console.error("Temporary verification product cleanup needs attention.");
      process.exitCode = 1;
    }
  }
  if (token) {
    try {
      await api("/api/users/logout", "POST", {});
    } catch {
      console.error("Verification session logout needs attention.");
      process.exitCode = 1;
    }
  }
  await db.end();
}
