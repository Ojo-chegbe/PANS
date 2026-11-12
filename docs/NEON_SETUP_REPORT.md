# Neon setup and verification

Completed 12 November 2026. The requested PostgreSQL setup is complete; the website is running locally against the hosted Neon database.

## Requested steps

| Step | Result |
| --- | --- |
| Install `neon@latest` globally | Passed; CLI version `9.4.0` |
| Initialize the specified organization/project/branch | Passed; `neon.ts` and ignored `.neon` created |
| Run `neon deploy` and pull environment variables | Passed after browser sign-in; exit 0 |
| Wire the declared service into the app | PostgreSQL wired through the existing Payload/Drizzle and `pg` adapter |
| Run `npm run build` | Passed; exit 0 |
| Start the app and prove the service works end to end | Passed; `npm run db:verify-neon` exit 0 |

Target: organization `org-dry-snow-01442117`, project `restless-math-74580572`, branch `production` (`br-divine-river-bdoaydca`). The existing database is in `aws-us-east-2`.

Only PostgreSQL was requested and deployed for this app. Neon Auth remains disabled; Payload continues to handle accounts and permissions. `NEON_FUNCTION_HOST_SUFFIX` is CLI metadata, not evidence that an application Function was provisioned.

## What changed

- `neon.ts` declares the branch configuration, and `@neon/config` / `@neon/env` were added by the CLI.
- `DATABASE_URL` is Neon's pooled runtime connection; `DATABASE_URL_UNPOOLED` is its direct migration connection. Credentials and `.neon` are ignored by Git.
- The PostgreSQL adapter keeps the existing transaction-capable driver, verifies TLS certificates, limits the Neon pool to five clients, and disables development schema auto-push on Neon.
- The existing local database was backed up to `.data/backups/20261112091258`, then restored atomically into the verified empty Neon database. All **107 public tables** and every table's row count matched after restoration.
- The original database remains intact and available through `LOCAL_DATABASE_URL`. The application secret, Resend key, site URL and local uploaded files were preserved.
- `npm run db:migrate` uses the direct connection. `npm run db:verify-neon` performs a focused live check. Destructive isolated integration checks are guarded to use local PostgreSQL and disable external email delivery.

The installed `neon` and `neon-postgres` skills were consulted. Their recommendation to preserve an existing PostgreSQL driver and separate pooled application traffic from direct migrations was followed.

## Command evidence

```text
npm i -g neon@latest
added 159 packages in 58s
Neon CLI install exit: 0

neon --version
9.4.0

neon init -y --org-id org-dry-snow-01442117 --project-id restless-math-74580572 --branch production --services postgres
Neon init exit: 0

neon deploy
Auth complete (profile DEFAULT)
→ Applying to branch production (br-divine-river-bdoaydca)
No changes — branch production already matches the policy.
Utilized services: Postgres
Pulled 5 Neon variables into .env.local
Neon deploy exit: 0
```

The deploy command pulled `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_BRANCH`, `NEON_BRANCH_ID`, and `NEON_FUNCTION_HOST_SUFFIX`. No connection strings or API keys are reproduced here.

```text
node scripts/transfer-to-neon.mjs
PASS: Restored 107 tables into Neon; all table row counts match.
PASS: Original local database, app secret, Resend configuration and upload files preserved.

npm run build
✓ Compiled successfully in 28.8s
Finished TypeScript in 67s ...
✓ Generating static pages using 7 workers (6/6) in 3.3s
npm run build exit: 0
```

The compiled app was started with `scripts/preview.mjs`:

```text
Local: http://127.0.0.1:3000
Ready in 760ms
```

```text
npm run db:verify-neon
PASS: Connected to Neon over verified TLS using the app's pooled PostgreSQL settings.
PASS: Transaction-scoped advisory locks work through Neon's pooler.
PASS: Running app homepage returns HTTP 200 with PANS content.
PASS: Existing administrator can sign in through the app against Neon.
PASS: Admin HTTP create/read/update persisted in Neon, confirmed over an independent database connection.
PASS: Temporary product deleted; verification left no saleable test product.
Neon end-to-end verification exit: 0
```

The temporary product remained unpublished with sales closed and was deleted. The verification session was logged out. Normal audit entries remain. No payment or email was sent by this check, and the broad test suite was not run.

## Problems encountered

- Initialization linked the project without authentication. Deployment opened browser sign-in; the user completed it and deployment resumed successfully.
- The first import attempt could not parse a Windows UTF-16 backup log. Encoding handling was corrected before database import began; the retry restored successfully.
- Initialization's dependency installation emitted engine warnings for the system Node version. Build and live verification explicitly used the project's Node `24.22.1` and passed.

There are no unresolved failures in the requested Neon setup or its build/live verification.

Raw setup logs, the pre-change environment snapshot and the table-count manifest remain in the ignored `.data/neon-setup` directory; `latest` identifies this run's folder. These files are local operational records, not public artifacts.

## Scope still separate

The database is hosted on Neon. The website still runs on this workstation; this command did not publish the Next.js app to a hosting provider. Uploaded file bytes remain local, and file hosting is still a separate task. Production launch requirements remain in the [launch checklist](LAUNCH_READINESS_CHECKLIST.md).
