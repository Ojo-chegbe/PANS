# PANS UNIJOS Digital Hub

A code-based Next.js and Payload application built from the supplied PANS mock. The original `PANS_Digital_Hub_new.html` is retained as the visual reference. The approved scope is in [the project plan](PANS_Digital_Hub_Project_Plan.md).

## Local development

Use Node.js 24.22.1 or newer. The development dependencies include a project-local Node runtime so npm scripts can use a compatible version without changing the computer's global installation.

Install dependencies:

```powershell
npm install
```

On this Windows workstation, PostgreSQL 18 is installed. Initialize or start the isolated project database:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/local-postgres.ps1
```

The database listens only on `127.0.0.1:55432`. Its generated credentials and application secret stay in ignored local files. To use another PostgreSQL instance, provide `DATABASE_URL`, `PAYLOAD_SECRET`, and `NEXT_PUBLIC_SERVER_URL` in `.env.local`. See `.env.example` for other settings.

The app is connected to the Neon `production` branch; existing local accounts and content were transferred with matching counts across all 107 tables. See [Neon setup](docs/NEON_SETUP.md). Runtime uses a pooled connection; schema migrations use the direct connection. `LOCAL_DATABASE_URL` preserves the separate local database for isolated checks.

Extract the original mock's assets and import its content:

```powershell
npm run extract:reference
npm run generate:types
npm run generate:importmap
npm run seed
```

Seeding preserves existing records and does not create accounts, invent stock, or fabricate course lessons and paid downloads. Purchases for imported catalogue entries remain closed until staff add the actual content or stock and enable sales. Existing association text and legacy records must be verified before launch.

Create an administrator:

```powershell
npm run admin:create -- your-email@example.com
```

For a new account, temporary credentials are written to `.data/admin-access.txt`, not printed in the terminal. For an existing account, this command adds the admin role without changing its password. Use organization-owned account details and replace temporary credentials before deployment.

Start the application and, in a second terminal, the notification worker:

```powershell
npm run dev
npm run jobs
```

The website is at `http://localhost:3000`; administration is at `http://localhost:3000/admin`.

Connect Resend using the [email setup guide](docs/RESEND_SETUP.md). Without Resend or SMTP configuration, development emails are captured as JSON files in `.data/mail`. Open the latest relevant file to use its verification or reset link. These files contain sensitive links and are ignored by version control. Production requires a real transactional email service.

Verification resend, expiring links, and password recovery are described in [account access](docs/ACCOUNT_ACCESS.md). Recovery signs out all devices and requires a fresh sign-in. Configure `RESEND_API_KEY` and `EMAIL_FROM_ADDRESS` to enable Resend delivery, or use the optional SMTP settings.

## Structure

- `src/app/(site)`: Public pages, member dashboards, learning, checkout, and custom endpoints.
- `src/app/(payload)`: Payload administration and content API.
- `src/cms`: Collections, content models, globals, and administration permissions.
- `src/services`: Commerce, enrolment, mentorship, registrations, and notifications.
- `src/lib`: Shared access checks, validation, transactions, and formatting.
- `src/data/reference.json`: Extracted reference content, used for initial import.
- `public/reference`: Extracted reference imagery and fonts.
- `scripts`: Setup, import, administrator provisioning, and job processing.
- `tests`: Domain, security, and isolated PostgreSQL integration checks.

## Checks

```powershell
npm run typecheck
npm test
npm run build
npm run test:browser
```

Integration tests create a separate temporary PostgreSQL database, exercise real permissions and workflows, then drop that test database. They do not run against the seeded application's tables.

Browser checks use the workstation's Microsoft Edge installation. They exercise responsive layouts, public navigation, registration and email verification, member actions, and administration. A local administrator must have been created first. Test accounts use reserved `example.test` addresses; account-flow checks may leave those test accounts in the local preview database.

To review the compiled application locally, run `npm run build` followed by `npm run preview`. The preview binds to the loopback interface and permits the local email outbox and file storage. This exception applies only to the explicit local preview; normal production startup still enforces production service configuration.

## Local backups

Create a PostgreSQL dump and copy local uploads, with a restore check in an isolated temporary database:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/backup.ps1 -Verify
```

Backups are stored in `.data/backups`. Preserve environment secrets separately and protect the backup directory. This local procedure does not replace scheduled off-site backups or private object-storage backups for deployment.

## Payments and protected files

Set `PAYSTACK_SECRET_KEY` for checkout and payment verification. Set `PAYSTACK_WEBHOOK_SECRET` when the Paystack account uses the modern webhook signing header. The endpoint is `/api/paystack/webhook`. Provider callbacks never directly mark an order paid; the backend verifies the reference, amount, currency, and customer before fulfilment.

Private files live outside `public`. Authorization applies to the file-serving endpoint as well as the download button. Configure private object storage for production; do not make the protected bucket publicly readable.

## Deployment and remaining launch inputs

Hosting has deliberately not been selected or configured. Production requires PostgreSQL, private persistent object storage, transactional email, a background-job runner, a strong application secret, HTTPS, and organization-owned service accounts. Use versioned database migrations rather than development schema push in production.

Real course content, saleable downloads, stock quantities, verified association records, contact details, final legal policies, provider credentials, and operational policies must be supplied before launch. The seeded privacy, terms, and refund pages explicitly indicate that their information is being prepared.

Administrative multifactor authentication, hosting-specific proxy and rate-limit configuration, off-site backup scheduling, and final cross-device visual verification must be settled before production release. Do not describe a local build as production-ready until the launch acceptance checks in the project plan have passed.

See [the admin guide](docs/ADMIN_GUIDE.md) for operating instructions.

See [the full launch-readiness checklist](docs/LAUNCH_READINESS_CHECKLIST.md) for the remaining development, content, service setup, verification, and handover work.
