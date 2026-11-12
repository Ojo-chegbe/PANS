# Neon database setup

Neon hosts the app's PostgreSQL database. Payload continues to handle authentication, roles, content and administration. File storage and email remain separate.

## Current CLI configuration

This checkout is linked to organization `org-dry-snow-01442117`, project `restless-math-74580572`, branch `production`. `neon.ts` declares the existing PostgreSQL setup with Neon Auth disabled. The linked project has been deployed and its PostgreSQL environment variables pulled with:

```powershell
neon init -y --org-id org-dry-snow-01442117 --project-id restless-math-74580572 --branch production --services postgres
neon deploy
```

The existing local database was backed up and transferred to the empty Neon database. All 107 public tables and their row counts matched after restoration. `LOCAL_DATABASE_URL` retains the separate local database connection. Database credentials and `.neon` remain ignored by Git.

The app keeps Payload's PostgreSQL/Drizzle adapter and `pg` driver. Runtime traffic uses pooled `DATABASE_URL`, certificate-verified TLS and a small connection pool. Versioned migrations use direct `DATABASE_URL_UNPOOLED`. Development schema auto-push is disabled for Neon.

The production build and the focused live integration check passed. See [the setup report and command output](NEON_SETUP_REPORT.md).

For a focused check against a running local app, use `npm run db:verify-neon`. It signs in with the existing local administrator, creates/updates/reads/deletes an unpublished temporary product through HTTP, and verifies persistence through an independent Neon connection. It also checks TLS and transaction-scoped advisory locks. It does not send emails or process payments.

The manual helper below remains available for configuring a different Neon connection. Do not re-import into an already populated database.

## Create the project and save its connection

1. Create a free project named **PANS Digital Hub** at [Neon Console](https://console.neon.tech). Select **PostgreSQL 18** to match the existing local database. Neon Auth is not required.
2. Open **Connect**, enable **Connection pooling**, and copy the PostgreSQL URL. Copy only the URL, without a `psql` command or surrounding quotes. Keep its SSL parameters.
3. Run this command from the project terminal:

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/configure-neon.ps1
   ```

   Paste the URL into the hidden prompt. The script validates the Neon hostname, saves the pooled URL and derives its corresponding direct URL in the ignored `.env.local` file. Do not paste either URL into chat or source control.

4. Tell Codex that the connection is saved. This step stages the connection; it deliberately leaves `DATABASE_URL` unchanged until existing data has been transferred.

## Transfer and switch

Before switching, stop the local app and any jobs worker so no records change during transfer. Create a fresh local database backup and retain the existing local upload directories. Use the staged **direct** connection to confirm the Neon destination is empty, then restore the PostgreSQL dump with ownership/ACL restoration disabled. Keep the local database intact. Do not run seed against the copied data or run initial schema migrations over a restored schema.

After restoration, compare source and destination table counts and required records. Then preserve the original URL as `LOCAL_DATABASE_URL`, activate the staged pooled URL as `DATABASE_URL`, and save the direct URL as `DATABASE_URL_UNPOOLED`. Keep `PAYLOAD_SECRET`, Resend settings and upload paths unchanged. Restart the app and check the existing account and catalogue load.

Copying the database preserves accounts, password hashes, content, relationships and migration history. Uploaded file bytes remain in the local `.data` folders; moving the database does not upload those bytes to Neon or complete file hosting.

## Runtime and future migrations

The app uses its existing PostgreSQL driver with a small connection pool and transaction-scoped locks. Neon connections disable development schema push and automatic database creation. The database is initialized by transferring the existing schema/data, then changed through versioned migrations.

Run future migrations with:

```powershell
npm run db:migrate
```

This command uses `DATABASE_URL_UNPOOLED` when configured. Runtime requests use the pooled URL. See [Neon pooling](https://neon.com/docs/connect/connection-pooling), [Neon import guidance](https://neon.com/docs/import/migrate-from-postgres), and [Payload PostgreSQL](https://payloadcms.com/docs/database/postgres).

Do not point isolated integration tests at Neon: their database creation/deletion belongs on the separate local PostgreSQL cluster. Do not copy cloud credentials into browser-exposed `NEXT_PUBLIC_` variables.
