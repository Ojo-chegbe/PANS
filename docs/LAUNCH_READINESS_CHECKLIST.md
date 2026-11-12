# PANS Digital Hub: full launch-readiness checklist

Audit date: 9 November 2026.

This is the remaining work needed to make the platform ready for real users, real payments, and ongoing operation. The code already supports substantial functionality locally; this checklist does not treat configuration stubs, imported mock content, or passing local tests as proof of production readiness.

An unchecked item means work or verification remains. Items that depend on a business decision must be explicitly accepted or excluded from launch scope, rather than silently assumed complete.

**Owners:** Development = code and technical verification. PANS = content, operating decisions, accounts, and acceptance. Shared = both.

## 1. Confirm launch scope and operating decisions — PANS + development

- [ ] Confirm which courses and products will actually be available on launch day.
- [ ] Confirm self-paced course delivery; specify additional requirements if any courses are live workshops.
- [ ] Confirm whether physical products are campus collection only; define location, hours, identification, collection deadlines, and uncollected orders. Delivery needs additional implementation if required.
- [ ] Confirm whether launch events are free. Paid ticketing is not an accepted completed feature of the current free-registration flow.
- [ ] Define who can register, what counts as verified PANS membership, and whether membership affects access or prices. Email verification and association membership are separate.
- [ ] Agree mentorship capacity, reassignment, cancellation, completion, escalation, and contact-sharing rules.
- [ ] Agree contributor ownership, review responsibilities, revenue sharing, and payouts. Sales/download counts are not a payout system. Implement payouts only if required for the agreed launch scope.
- [ ] Confirm whether product variants, certificates, attendance records, or live-course capacity are required. These must not be assumed implemented by the basic product and lesson models.
- [ ] Name the people responsible for administration, customer support, finance, fulfilment, moderation, and technical maintenance.

**Complete when:** launch scope and operating rules are written down and approved by PANS.

## 2. Finish account and authentication experience — development

- [ ] Add a safe resend-verification flow with rate limiting and account-enumeration protection. Existing unverified users need a recovery path.
- [ ] Finish the verification experience: clear success, expired/invalid/already-used links, and an obvious next step to sign in.
- [ ] Verify registration, sign-in, sign-out, reset, expired sessions, and protected-link redirects with actual email delivery on staging.
- [ ] Confirm password changes/reset invalidate the appropriate old sessions and that logout works across the intended account surfaces.
- [ ] Decide and implement the secure process for changing account email, account deletion requests, and membership verification. Current support links alone are not a completed self-service workflow.
- [ ] Verify the redesigned account pages with real courses, purchases, requests, unread updates, long names, and multiple records—not only empty dashboards.
- [ ] Verify guest basket retention and merge behavior through sign-in, logout, account switching, and use on another device.

**Complete when:** a new member can register, recover access, and use their account without developer help.

## 3. Connect and validate real email — shared

- [ ] Create an organization-owned transactional email account and verified sender domain.
- [ ] Configure sending credentials and sender address. Reconcile the current `.env.example` `EMAIL_FROM` setting with the adapter's `EMAIL_FROM_ADDRESS` variable.
- [ ] Configure the sender's DNS authentication as required by the chosen service and verify inbox delivery to representative recipients, including Gmail.
- [ ] Test verification, reset, registration, purchase, refund, and mentorship messages using the deployed domain, with no localhost links.
- [ ] Complete useful email templates and clear links back to the relevant account page.
- [ ] Monitor failed delivery, retry exhausted jobs, and provide a support path for missing messages. Include immediate account emails as well as queued notifications in failure handling.
- [ ] Remove preview-specific delivery messages from the production experience by correctly configuring the production service; retain truthful local-preview feedback.

**Complete when:** real users receive the right emails and delivery failures are visible to operators.

## 4. Finish staff-triggered notifications — development

The current service actions generate some notifications, but the collection hooks for several staff edits primarily record audit entries. Audit entries are not user notifications.

- [ ] Notify the mentor and student when staff assign or reassign a mentorship request.
- [ ] Notify applicants when mentor/contributor applications are approved, rejected, or need more information.
- [ ] Notify contributors when submissions are published, rejected, or returned for changes.
- [ ] Notify customers when physical orders are ready for collection, collected, cancelled, or require attention.
- [ ] Notify the support team when a contact message arrives; define assignment and resolution handling.
- [ ] Define and implement notification handling for event cancellation and material schedule changes.
- [ ] Ensure repeated saves, retries, and repeated webhook delivery do not send duplicate notifications.
- [ ] Verify all notifications reach the correct people and expose no private internal notes.

**Complete when:** important changes made through administration reach the affected users reliably.

## 5. Make the actual catalogue sale-ready — PANS + development

- [ ] Review imported titles, prices, descriptions, categories, imagery, and product ownership.
- [ ] Enter real stock quantities for physical products; do not use invented stock to make buttons appear active.
- [ ] Upload the actual paid digital files and check their labels, versions, file types, and ownership.
- [ ] Create the actual course modules and lessons, instructors, attachments, video content, and lesson order.
- [ ] Confirm each product points to the correct course or protected file.
- [ ] Tighten publication/sales validation so an enabled course cannot appear buyable in one part of the catalogue while its detail page rejects it for having no ready lessons. Keep listing, detail, basket, and backend availability rules consistent.
- [ ] Ensure unpublished or withdrawn course content has a defined effect on existing purchasers and enrolments.
- [ ] Enable sales and publish only the products that are genuinely ready.
- [ ] Confirm unavailable, sold-out, free, already-purchased, and withdrawn products have clear and consistent actions.
- [ ] Verify real course enrolment, lesson completion, progress persistence, video access, and file access across devices.

**Complete when:** every launch product can be purchased or enrolled in and fulfilled as described.

## 6. Validate payments, orders, and refunds with the real provider — shared

- [ ] Set up the organization-owned Paystack account, complete its required setup, and configure test credentials securely.
- [ ] Configure the deployed callback and webhook endpoints and the signature scheme used by the actual account.
- [ ] Run real provider sandbox transactions. Existing integration tests mock provider responses and do not replace this step.
- [ ] Test successful, failed, abandoned, pending, delayed, duplicated, and mismatched payments end to end.
- [ ] Verify server-calculated prices, quantities, currency, customer identity, and reference matching.
- [ ] Verify stock reservation expiry, simultaneous purchases of the last item, and payments received after a reservation expires.
- [ ] Verify digital access/enrolment is granted once and physical fulfilment is not accidentally marked complete by payment alone.
- [ ] Test provider-confirmed full refunds, repeated requests, access revocation, and appropriate restocking.
- [ ] Decide the handling of partial refunds and implement it if required. Current partial refunds do not automatically remove access.
- [ ] Define reconciliation and support procedures for paid orders needing staff attention and provider/local discrepancies.
- [ ] Confirm receipts and finance reporting meet PANS's operating requirements.
- [ ] Switch to live credentials only after sandbox acceptance, then perform an authorized low-value live purchase and agreed refund check.

**Complete when:** payment, access, inventory, and refund outcomes match provider records and the agreed policies.

## 7. Complete mentorship and contributor operations — shared

- [ ] Add and verify real mentor profiles, expertise, availability, and capacity.
- [ ] Enforce valid assignments: an approved, eligible mentor account; permitted availability; capacity limits; and valid request status transitions.
- [ ] Fix or verify safe mentor identity display for the student. The user collection restricts other members' records, so populated user relationships cannot be assumed to expose the mentor's name.
- [ ] Provide the agreed way for an assigned mentor and student to contact each other without revealing unrelated personal information.
- [ ] Verify acceptance, decline, reassignment, cancellation, and completion from both dashboards.
- [ ] Complete the contributor journey from application through approval, upload, review notes, resubmission, publication, and statistics.
- [ ] Verify download/sales metrics reflect the intended definitions, refunds, pagination, and larger submission counts.
- [ ] Implement any additional financial reports or payout workflows agreed in section 1.

**Complete when:** staff can run these programmes without manual database fixes or off-platform developer intervention.

## 8. Finish association content and administration coverage — shared

- [ ] Replace placeholder legal pages and incomplete information pages with approved content.
- [ ] Confirm official contact details, social links, organization name, branding, homepage claims, and counters.
- [ ] Verify leadership names, sessions, photographs, achievements, and the distinction between unverified and verified records.
- [ ] Add real events, dates, venues, capacities, programmes, speakers, deadlines, and cancellation information.
- [ ] Add launch resources, articles, opportunities, gallery captions, and project milestone updates.
- [ ] Verify permissions and rights to use the mock's photographs, fonts, learning materials, and downloads.
- [ ] Audit every public content area against admin controls: text, images, links, calls to action, section visibility/order, SEO, and page introductions.
- [ ] Exercise create, edit, draft, preview, publish, unpublish, version restore, search, filter, and export for each relevant content model.
- [ ] Improve any remaining admin labels or validation that could lead to pricing, publishing, assignment, or fulfilment mistakes.
- [ ] Add the operational reporting needed beyond the current headline counts: relevant sales/revenue, downloads, mentors, registrations, and mentorship reports with agreed definitions and date filters.

**Complete when:** authorized staff can manage all agreed content and operations through the admin interface.

## 9. Protect records, accounts, and uploads — development

- [ ] Implement administrative MFA and a documented recovery method.
- [ ] Replace temporary administrator details with named organization-owned accounts and review role assignments.
- [ ] Audit all API and file endpoints for anonymous, member, contributor, mentor, manager, and administrator access—not only visible UI controls.
- [ ] Strengthen deletion/archive rules for purchased products, paid files, courses, orders, financial records, and audit history. Prevent routine deletion from breaking purchases or removing required history.
- [ ] Review email changes, protected verification fields, role changes, and membership privileges through direct API requests.
- [ ] Add deployment-level abuse controls to complement existing action-level limits, including signup, login, reset, contact, upload, and expensive public endpoints.
- [ ] Configure trusted proxy/client-address handling for the chosen host and check behavior across multiple application instances.
- [ ] Verify upload type/size restrictions, private bucket access, signed download behavior, and handling of untrusted contributor files; choose any additional scanning/quarantine process required for launch.
- [ ] Review input handling, rendered rich text, external URLs, CSV exports, CSRF, session cookies, and security headers on the deployed site.
- [ ] Protect secrets and private records in logs, browser responses, backups, and source control; review dependencies before release.

**Complete when:** a focused security review passes with documented fixes and tested account recovery.

## 10. Define data and customer policies — PANS, with appropriate review

- [ ] Approve privacy information, terms, refunds, fulfilment, acceptable content, and support policies appropriate to the actual service.
- [ ] Decide what personal data is needed, who may see it, and how long it is retained.
- [ ] Establish account deletion, data access/export, complaints, and incident handling procedures; implement the supporting tools needed to operate them.
- [ ] Align consent wording and enforcement with those decisions and the finalized policies.
- [ ] Define access to event exports, mentor/student contact information, contribution files, and financial records.
- [ ] Review use of any analytics or tracking before enabling it and implement any required user controls.

**Complete when:** the published policies match actual platform behavior and staff can carry them out.

## 11. Set up staging and production services — shared

- [ ] Choose hosting that supports the application, database connections, uploads, and background processing; hosting remains undecided.
- [ ] Create separate development, staging, and production configuration, data, service credentials, and file storage.
- [ ] Provision the production PostgreSQL database with suitable access controls, connection limits, and pooling.
- [ ] Provision persistent object storage; configure protected files and public imagery deliberately and test direct unauthorized requests.
- [ ] Test file sizes, upload routes, image processing, downloads, and video delivery against the actual host's limits.
- [ ] Run the notification/reservation-maintenance worker continuously or deploy an equivalent reliable scheduled runner; a local terminal is not production scheduling.
- [ ] Configure production secrets, application URL, job authentication, email, payment, and storage variables.
- [ ] Connect the chosen domain, HTTPS, redirects, and production cookie/origin settings.
- [ ] Ensure local-preview exceptions are not enabled on production and production does not rely on `.data` uploads or the local email outbox.
- [ ] Deploy and test database migrations on a fresh staging database and an upgrade of existing data.
- [ ] Set up an organization-owned remote source repository, commit the source, and configure automated checks and a reproducible deployment process.
- [ ] Document release, rollback, secret rotation, and environment recovery procedures.

**Complete when:** the staging and production environments can run independently of this workstation.

## 12. Add monitoring, scheduled backups, and recovery — development + operations

- [ ] Set up application error reporting, uptime checks, and actionable alerts.
- [ ] Monitor email failures, stuck jobs, webhook failures, payment discrepancies, storage errors, database health, and expiring reservations.
- [ ] Ensure expected job failures are recorded with useful, redacted diagnostic details and can be investigated/retried.
- [ ] Schedule encrypted off-site database backups and an appropriate file/object-storage backup strategy.
- [ ] Set backup retention, access controls, recovery objectives, and a named recovery owner.
- [ ] Test restoration of both database and actual files into a clean environment, including a paid user's ability to sign in and retrieve a purchase.
- [ ] Verify recovery after worker downtime, provider downtime, a bad deployment, and a failed migration.
- [ ] Create concise operational runbooks and an escalation path.

**Complete when:** failures are detected and PANS can recover the running service and its data. The existing local database restore check is useful evidence, but not the entire production recovery process.

## 13. Complete design, accessibility, discovery, and performance checks — development + PANS

- [ ] Review the complete website and account/admin experiences against the approved mock and the latest account design; keep the established typography, colours, and restraint.
- [ ] Review populated lists, long content, validation errors, unavailable items, empty states, loading states, and recovery from failed actions.
- [ ] Test keyboard navigation, focus, forms, password controls, menus, dialogs, gallery controls, semantic structure, and screen-reader announcements.
- [ ] Check contrast, zoom, reduced motion, readable labels, meaningful image descriptions, and touch target sizes.
- [ ] Test representative real phones and Chrome, Edge, Firefox, and Safari. Previous local browser automation primarily covered Edge.
- [ ] Measure representative pages under mobile network conditions; optimize images, queries, pagination, and scripts. Check the specification's 80+ mobile PageSpeed target on the deployed build.
- [ ] Load-test the agreed expected usage, including simultaneous registration and purchases and the capacity of the job runner/database.
- [ ] Verify public search and filters, expired opportunities, event status changes, pagination, and broken links with real content.
- [ ] Finish page titles, descriptions, canonical URLs, social preview images, sitemap coverage, redirects, and appropriate indexing exclusions.

**Complete when:** the agreed design, usability, accessibility, browser, and performance acceptance checks pass.

## 14. Run final acceptance and hand over — shared

- [ ] Run the full automated suite against the release candidate, including all current browser tests; do not combine earlier partial runs into a claim that the final suite passed.
- [ ] Test complete real-service staging journeys for a student, mentor, contributor, manager, administrator, and guest.
- [ ] Demonstrate: publish course → buy/enrol → learn → retain progress; publish product → purchase → fulfil/refund; register event → export; apply/assign mentorship → accept/complete; contribute → review/resubmit → publish.
- [ ] Verify email and permissions throughout those journeys and resolve launch-blocking defects.
- [ ] Remove disposable QA accounts, test catalogue entries, test orders/jobs, preview-only configuration, and placeholder launch content without deleting genuine records.
- [ ] Train staff to manage products, courses, content, events, mentors, contributors, orders, support, and failed jobs.
- [ ] Hand over organization-owned accounts, source, environment inventory, admin guide, deployment/runbooks, and secure credential access.
- [ ] Take and verify a final pre-launch backup; rehearse rollback.
- [ ] Obtain PANS's acceptance of the actual staging application, deploy the accepted release, and perform live smoke checks.
- [ ] Assign ongoing responsibilities, service budgets, update schedules, and the process for future leadership transitions.

**Complete when:** the deployed site passes acceptance, PANS can operate it, and maintenance/recovery responsibilities are in place.

## Recommended order

1. Confirm launch products and operating rules; finish the remaining account/notification/permission workflows.
2. Upload real content and stock; configure staging email, payment, storage, and background processing.
3. Validate complete journeys with real service accounts; finish security, reporting, and administration gaps.
4. Finish production infrastructure, backups, monitoring, accessibility, performance, and browser checks.
5. Run acceptance, training, final backup, and controlled production launch.

## Evidence already available

The repository contains a compiled local application, a 20-test domain/security/PostgreSQL integration suite that has passed, earlier public responsive checks, passing focused account/admin checks after the redesign, a passing temporary-product basket/Buy-now browser check, and a local backup restoration check. Account entry screens and password toggles were also checked at desktop/mobile widths. These are a starting point for release verification, not substitutes for the open checklist above.
