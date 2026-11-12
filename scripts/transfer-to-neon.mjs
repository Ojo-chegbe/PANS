/** One-time, non-destructive import of the backed-up local database into empty Neon. */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";
import { spawnSync } from "node:child_process";
import pg from "pg";
import { rootCertificates } from "node:tls";

const setup = readFileSync(".data/neon-setup/latest", "utf8").trim();
const before = readFileSync(path.join(setup, ".env.local.before"), "utf8");
const current = readFileSync(".env.local", "utf8");
const sourceEnv = parseEnv(before);
const targetEnv = parseEnv(current);
const sourceURL = new URL(sourceEnv.DATABASE_URL);
const directURL = new URL(targetEnv.DATABASE_URL_UNPOOLED);
if (!["localhost", "127.0.0.1"].includes(sourceURL.hostname))
  throw new Error(
    "Import source must be the existing local PostgreSQL database.",
  );
if (
  !directURL.hostname.endsWith(".neon.tech") ||
  directURL.hostname.includes("-pooler.")
)
  throw new Error("Import target must be the direct Neon connection.");
for (const key of [
  "PAYLOAD_SECRET",
  "RESEND_API_KEY",
  "NEXT_PUBLIC_SERVER_URL",
])
  if (sourceEnv[key] !== targetEnv[key])
    throw new Error(`${key} must be preserved.`);
const backupBytes = readFileSync(path.join(setup, "backup.log"));
const backupLog = backupBytes.toString(
  backupBytes[0] === 0xff && backupBytes[1] === 0xfe ? "utf16le" : "utf8",
);
const backupName = backupLog.match(
  /Backup saved in \.data\/backups\/(\d{14})/,
)?.[1];
if (!backupName)
  throw new Error("A fresh local backup is required before importing.");
const dump = path.resolve(".data/backups", backupName, "database.dump");
writeFileSync(path.join(setup, "neon.env"), current);
const rootCertPath = path.join(setup, "trusted-roots.pem");
writeFileSync(rootCertPath, rootCertificates.join("\n"));
directURL.searchParams.set("sslmode", "verify-full");
const source = new pg.Client({
  connectionString: sourceURL.href,
  connectionTimeoutMillis: 30000,
});
const target = new pg.Client({
  connectionString: directURL.href,
  connectionTimeoutMillis: 30000,
});
const quote = (name) => '"' + name.replaceAll('"', '""') + '"';
async function tables(client) {
  return (
    await client.query(
      "select tablename from pg_tables where schemaname='public' order by tablename",
    )
  ).rows.map((r) => r.tablename);
}
async function counts(client, names) {
  const sql = names
    .map(
      (name) =>
        `select '${name.replaceAll("'", "''")}' as table_name, count(*)::text as records from public.${quote(name)}`,
    )
    .join(" union all ");
  return (await client.query(sql)).rows;
}
try {
  await source.connect();
  await target.connect();
  if ((await tables(target)).length)
    throw new Error(
      "Neon already has public tables. Import refused; no tables were changed.",
    );
  const activity = await source.query(
    "select count(*)::int as connections from pg_stat_activity where datname=current_database() and pid<>pg_backend_pid() and backend_type='client backend'",
  );
  if (activity.rows[0].connections)
    throw new Error("Stop the app and jobs worker before transferring data.");
  const names = await tables(source);
  if (!names.includes("users") || !names.includes("products"))
    throw new Error("The source does not contain the expected app database.");
  const beforeCounts = await counts(source, names);
  const restore = spawnSync(
    "C:/Program Files/PostgreSQL/18/bin/pg_restore.exe",
    [
      "--no-owner",
      "--no-acl",
      "--exit-on-error",
      "--single-transaction",
      "--host",
      directURL.hostname,
      "--port",
      directURL.port || "5432",
      "--username",
      decodeURIComponent(directURL.username),
      "--dbname",
      decodeURIComponent(directURL.pathname.slice(1)),
      dump,
    ],
    {
      env: {
        ...process.env,
        PGPASSWORD: decodeURIComponent(directURL.password),
        PGSSLMODE: "verify-full",
        PGSSLROOTCERT: rootCertPath,
        PGCONNECT_TIMEOUT: "30",
      },
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 8 * 1024 * 1024,
    },
  );
  writeFileSync(path.join(setup, "restore.log"), String(restore.stderr || ""));
  if (restore.error || restore.status !== 0)
    throw new Error(
      "Neon restore failed. Details are in the ignored restore.log; the restore transaction was rolled back.",
    );
  const restoredNames = await tables(target);
  if (JSON.stringify(restoredNames) !== JSON.stringify(names))
    throw new Error("Restored table names do not match the local database.");
  const afterCounts = await counts(target, names);
  if (JSON.stringify(beforeCounts) !== JSON.stringify(afterCounts))
    throw new Error("Restored row counts do not match the local database.");
  const envWithoutLocal = current.replace(
    /^LOCAL_DATABASE_URL=.*(?:\r?\n|$)/gm,
    "",
  );
  writeFileSync(
    ".env.local",
    envWithoutLocal.trimEnd() +
      `\nLOCAL_DATABASE_URL=${sourceEnv.DATABASE_URL}\n`,
  );
  writeFileSync(
    path.join(setup, "data-transfer.json"),
    JSON.stringify(
      {
        tables: names.length,
        rowCounts: afterCounts,
        backup: `.data/backups/${backupName}`,
        completedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
  console.log(
    `PASS: Restored ${names.length} tables into Neon; all table row counts match.`,
  );
  console.log(
    "PASS: Original local database, app secret, Resend configuration and upload files preserved.",
  );
} catch (error) {
  writeFileSync(".env.local", before);
  console.error(
    error instanceof Error ? error.message : "Database transfer failed.",
  );
  console.error(
    "The app environment has been restored to the original local database. Neon credentials remain in the ignored setup backup.",
  );
  process.exitCode = 1;
} finally {
  await source.end();
  await target.end();
}
