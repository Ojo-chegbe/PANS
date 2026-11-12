# Cloudflare Workers trial

Started: 12 November 2026. Status: protected remote trial deployed on Workers Free; real CPU-limit failures confirmed.

## Finding

The protected preview is deployed and available for compatibility testing. Trial-specific changes address native Sharp loading, database connection ownership, remote origins, password hashing, Secure cookies and private static-asset routing. The main application has not been migrated to this configuration.

**Workers Free is not reliable for the current backend.** Actual remote requests returned HTTP 503 with Cloudflare outcome `exceededCpu`, including authenticated account reads, product updates and logout. Some heavier requests completed under Cloudflare's allowance for occasional overruns; that does not negate the recorded failures. No paid subscription was enabled.

## Access and current deployment

- URL: [Private PANS Workers trial](https://pans-workers-trial.pans-hub-1df319.workers.dev).
- Browser gate username: `trial`. The gate password and separate admin/student account passwords are in the ignored `.data/cloudflare-trial/TEST_ACCESS.txt` file.
- Use the supplied trial accounts; copied existing accounts retain incompatible 600k password hashes.
- Test database expires **19 November 2026 at 12:00 UTC / 13:00 WAT**.
- Current asset-gateway version: `c8353cea-0354-4907-807b-736f4076a068`.
- Upload: 20,721.85 KiB uncompressed; gzip 4,598.07 KiB. Startup: 61 ms.
- The primary local app and its production database, password settings and email key remain in place.
- Preview email delivery, payment gateway, uploads/video storage and scheduled jobs are not configured. Account verification/recovery emails and paid playback are not claimed as passing.

## Confirmed remote results

All seven main public/account/login pages returned HTTP 200. Anonymous basket access and anonymous product creation were denied. The separate admin and student accounts both authenticated remotely. The hosted gateway adds Secure to session cookies, preserves HttpOnly, and rejects requests without its private access key.

During repeated operations, Cloudflare recorded these actual failures:

| Operation | HTTP result | Cloudflare outcome |
| --- | --- | --- |
| Repeated `/api/users/me` | 503 | `exceededCpu` |
| Update temporary product | 503 | `exceededCpu` |
| Administrator logout | 503 | `exceededCpu` |
| Student product-create permission probe | 503 | `exceededCpu`; permission result could not be established for that request |

Example measured CPU times from that run: homepage cold request 928 ms; store 86 ms; courses 57 ms; sign-in page 72 ms. The failed account read recorded 49 ms; product update and logout were terminated at 10 ms. CPU figures are Cloudflare trace values, not response durations.

The first cookie assertion incorrectly rejected Payload's `HttpOnly=true` syntax, despite a successful login response. The checker was corrected to accept it and avoid logging token values. This was a test assertion issue, distinct from the verified CPU-limit failures.

The first browser walkthrough exposed another gateway issue: protected JavaScript/font URLs were reaching Next's HTML 404 handler. The private gateway now serves `/_next/static/` and `/reference/` directly from the asset binding after access checks. A published JavaScript file and Aeonik font then both returned HTTP 200 with correct MIME types. The full browser walkthrough is being captured separately.

Request-scoped database connections eliminated the earlier active-request socket-sharing failure in the recorded run. Remaining closed-socket events were tagged **cleanup**, after response completion. Those cleanup warnings remain a limitation of the trial adapter. Hyperdrive was investigated as a possible way to reduce database handshake overhead, but was not provisioned or benchmarked; no claim is made that it resolves the CPU budget.

## Purpose and isolation

Test the existing Next.js/Payload application on Workers, including whether the free tier can run it. A successful local preview does not establish compliance with the remote CPU limit.

- Trial source and private logs: `.data/cloudflare-trial/source` and `.data/cloudflare-trial/` (ignored).
- The regular local server and production configuration remain in place.
- Neon branch `cloudflare-trial-20261112` (`br-falling-wave-bdzs942z`) was created from production. Its expiry was extended to 19 November 2026 at 12:00 UTC for user testing. Trial writes must use this branch.
- Trial uses a different Payload secret. Production email, payment and storage credentials were not copied.
- No paid Workers subscription or R2 bucket has been enabled.
- Root TypeScript configuration excludes `.data` so the isolated source is not compiled into the main application.

## Baseline and local test matrix

| Check | Status | Evidence / next action |
| --- | --- | --- |
| Isolated source and database | Passed | Separate source copy, database branch and app secret created; verified TLS, transactions and advisory locks; eight product records present |
| Install OpenNext and Wrangler | Passed | OpenNext 1.20.17, Wrangler 4.160.1; existing Next 16.4.5 and Payload 3.93.0 retained |
| Next.js production build | Passed with warnings | Compilation, TypeScript and page generation completed; Next route report emitted |
| Worker bundle generation | Passed with warnings | OpenNext baseline exited 0; Worker generated |
| Worker size | Passed local packaging | Wrangler dry run: 20,731.60 KiB uncompressed / 4,601.42 KiB gzip; current Cloudflare docs specify 64 MiB uncompressed |
| Worker startup | Baseline fails; adapted app starts | Native Sharp import fails; trial removes Sharp and avoids unnecessary disk initialization |
| Public routes and assets | Intermittent after adaptation | Seven pages passed HTTP checks; store hydrated in Edge; subsequent browser sign-in returned 500 |
| Authentication | Intermittent after adaptation | Login, three authenticated requests and logout passed one HTTP run; later sign-in requests hit database timeouts |
| Admin | Partial | Login page and product create/read/update/delete passed; complete admin browser workflow not reached |
| Basket | Partial | Anonymous reads denied, stale-owner writes denied; member/guest browser persistence not fully exercised |
| Checkout and payment callbacks | Not exercised | Gateway credentials absent; no payment attempted |
| Learning access | Not exercised | Full entitlement, lesson and download flows await stable runtime and configured media |
| Uploads and playback | Not configured | No storage bucket/credentials; local disk is not durable hosted storage |
| Background work | Requires adaptation | Existing `scripts/jobs.ts` is a persistent loop; Workers requires bounded scheduled/event execution |
| Free-plan CPU | Confirmed remote failures | See the remote result table above; local success did not establish free-tier reliability |

## Known constraints to investigate

OpenNext warns that Windows support is incomplete and recommends WSL. WSL is not installed on this computer. It also warns that Node.js middleware support is experimental. These warnings are not themselves evidence of a failed application request.

Installation completed successfully, with npm engine warnings because the system npm entry point used Node 24.13.0. The actual build is explicitly launched with Node 24.22.1; the trial also includes the app's pinned Node 24.22.1 dependency.

The current application imports native Sharp and the local SQLite adapter, initializes a local `.data` directory, retains a PostgreSQL connection pool, and uses local file storage when S3 is not configured. Sharp and repeated database requests produced observed failures. SQLite import and disk-based uploads were not separately established as runtime failures in this trial.

Payload's official minimal Workers template and OpenNext troubleshooting still refer to older 3 MiB free / 10 MiB paid compressed size limits. However, Cloudflare's current limits page specifies 64 MiB uncompressed for both plans, with no compressed-size limit. Use the current platform documentation and actual deployment validation, not the older template warning.

Cloudflare device authorization completed successfully (`Successfully logged in.`); the earlier browser callback attempt expired. Authentication is no longer the deployment blocker.

## Observed baseline failure

The baseline Worker returned HTTP 500 for the home page, store, courses, sign-in, join, recovery, admin login, basket API, product API and login API. All share the same bootstrap failure, rather than ten independent feature bugs:

```text
Error: Could not load the "sharp" module using the linuxnull-x64 runtime
Dynamic require of "@img/sharp-linuxnull-x64/sharp.node" is not supported
```

The native Sharp binary cannot load in workerd. A trial-only adaptation removes the explicit Sharp import/configuration and skips local `.data` directory creation when an environment secret is supplied. This allows further compatibility investigation; it does not establish that upload image transformations work. The production source is unchanged.

## Results after the bootstrap adaptation

The adapted build passed. The first homepage request returned HTTP 200. Admin login page, anonymous basket rejection and an administrator authentication request also succeeded. However, subsequent catalogue/account requests returned HTTP 500, and repeated authenticated requests failed. Logs include Workers requests canceled as hung and PostgreSQL connection timeouts. This is consistent with a reused connection pool crossing request boundaries; that explanation remains under investigation.

Product creation succeeded in the temporary branch, but its update and cleanup request failed. That temporary product was subsequently deleted using the Node CLI against the isolated database. An independent PostgreSQL query confirmed that ID 11 and all diagnostic product slugs are absent.

The first version of the diagnostic script used an invalid product body and a negative basket owner ID for denial checks. HTTP 400 from validation on those inputs does not establish an authorization bug. Those two probes were corrected before the next run.

A second trial-only adaptation sets PostgreSQL pool `maxUses: 1` to retire connections after use; it retains the transaction-capable driver. Its build passed. After a clean restart, all 14 focused HTTP checks passed:

```text
Pool-isolation checks exit: 0
PASS Page /
PASS Page /store
PASS Page /courses
PASS Page /sign-in
PASS Page /join
PASS Page /forgot-password
PASS Page /admin/login
PASS Anonymous basket is private
PASS Anonymous admin mutation denied
PASS Admin authentication
PASS Repeated authenticated requests
PASS Product create/read/update/delete
PASS Stale basket owner rejected
PASS Logout revokes session
```

However, the next real Edge browser run passed the store page and then failed:

```text
PASS browser /store
Error: /sign-in returned 500
```

The runtime emitted `TypeError: This socket has been closed` and `timeout exceeded when trying to connect`. This invalidates any claim that `maxUses: 1` alone fixes database reliability. The installed PostgreSQL adapter's `dist/connect.js` creates a pool and retains a checked-out monitoring client. A complete solution needs to account for request-scoped connections and cleanup, including Payload initialization, transactions and concurrent requests. Merely changing database providers or increasing CPU allowance does not demonstrate a fix.

## Artifacts, reproduction and cleanup

Commands run from the isolated source, with Node 24.22.1:

```text
node node_modules/@opennextjs/cloudflare/dist/cli/index.js build
# Baseline and adapted builds completed successfully; invokes npm run build.
node node_modules/wrangler/bin/wrangler.js deploy --dry-run --outdir ../dry-run
# Exit 0. Total Upload: 20731.60 KiB / gzip: 4601.42 KiB
node node_modules/wrangler/bin/wrangler.js dev --ip localhost --port 8787
```

Private evidence is under `.data/cloudflare-trial/`: `build-baseline.log`, `bundle-size.log`, `workerd-baseline.log`, `runtime-baseline.log`, `build-adapted.log`, `runtime-adapted.log`, `build-pool-isolation.log`, `runtime-pool.log`, `workerd-pool.log`, `workerd-pool.error.log`, and `browser-check.log`. Logs can contain sensitive details and must remain ignored.

The isolated preview was stopped after testing. The existing main app on port 3000 was left running. Temporary products were removed and independently verified absent. The cleanup helper removed the record but lingered during shutdown; it was terminated after database verification. The test branch remains available until its scheduled expiry.

The trial-only source changes are in `.data/cloudflare-trial/source/src/payload.config.ts`, `src/lib/database.ts` and `trial-worker.mjs`. The primary app retains its Sharp configuration and database settings. Its only configuration change for this experiment is excluding `.data` from TypeScript compilation.

## Remote deployment status

- Wrangler device sign-in succeeded.
- The account had no Workers subdomain. `pans-hub-1df319.workers.dev` was configured; the prepared app name is `pans-workers-trial`.
- The remote entry point denies all requests without a private access key and sends `noindex` headers. Static assets run through that gate too.
- Cloudflare rejected the custom CPU setting with error `100328`: custom CPU limits are not supported on the Free plan. This confirms the account is Free. The unsupported setting was removed; the account was not upgraded.
- The user explicitly approved uploading the protected app and temporary credentials after the initial automatic review rejection. Deployment then succeeded. Worker startup was 21 ms for the first version and 23 ms for the request-scoped version.
- The remote URL is `https://pans-workers-trial.pans-hub-1df319.workers.dev`. A browser access password is required. Secrets were installed through Wrangler; credentials are stored locally in the ignored `.data/cloudflare-trial/TEST_ACCESS.txt` file.
- The trial now uses its actual remote URL for origin checks, cookies and generated links. Trial-only production guards allow this exact access-controlled preview; the main app's guards remain unchanged.
- A request-scoped PostgreSQL pool adapter was added to the isolated copy. It retains the existing PostgreSQL driver and transaction support, scopes connections to a Worker request, and schedules cleanup after response streaming finishes. Sequential and concurrent local requests passed. Remote public-page checks passed; account checks exposed the separate password-hashing constraint described below.
- Email delivery, payment credentials, file storage and a scheduled job trigger are not configured for this preview.

## Workers password-hashing constraint

The copied administrator account uses Payload's default PBKDF2 600,000-iteration hash. Workers does not support more than 100,000 PBKDF2 iterations. The copied account returned HTTP 500 remotely. Payload documents `auth.passwordHashIterations: 100000` specifically for these environments.

The isolated trial now uses that documented setting. Two separate, manually verified trial accounts were created: `cloudflare-admin@pans.local` (admin) and `cloudflare-student@pans.local` (student). Both use fresh random passwords and 100k-prefixed hashes, independently verified in the isolated database. Passwords are in `TEST_ACCESS.txt`, not this report. Existing users and their hashes were not reset. The main app retains its 600k default.

This is a trial-specific security tradeoff, not a production authentication decision. Existing copied users with 600k hashes should not be used to assess trial login. Verification and recovery email flows have not been proven remotely.

The first account setup attempt used an invalid `member` role and was rejected by validation. It was corrected to `student`; both accounts were then created and independently checked. The subsequent build passed. The completed Node setup helper required termination after database verification because it lingered during shutdown.

Reference: [Payload password hashing configuration](https://payloadcms.com/docs/authentication/overview).

References:

- [OpenNext setup](https://opennext.js.org/cloudflare/get-started)
- [OpenNext troubleshooting and bundle-size limits](https://opennext.js.org/cloudflare/troubleshooting)
- [Payload official Workers template](https://github.com/payloadcms/payload/tree/main/templates/with-cloudflare-d1)
- [Current Cloudflare Workers limits](https://developers.cloudflare.com/workers/platform/limits/)

Never commit trial credentials or logs containing connection strings.
