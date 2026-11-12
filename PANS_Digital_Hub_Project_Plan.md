# PANS UNIJOS Digital Hub Project Plan

Date: 8 November 2026  
Status: Local implementation and verification in progress; production launch setup remains outstanding.

This plan defines the work needed to turn the existing PANS Digital Hub mock into a fully coded platform with a functional public website, member dashboards, and an administration system. The existing mock remains the visual reference. Hosting remains undecided.

## Project references and direction

- Functional reference: `PANS_UNIJOS_Digital_Hub_Developer_Specification.docx`, supplied from the owner's Downloads folder.
- Visual reference: [PANS_Digital_Hub_new.html](PANS_Digital_Hub_new.html).
- The WordPress, Elementor, WooCommerce, and WordPress-specific implementation instructions in the specification will be replaced by the code-based architecture proposed below. Their underlying functional requirements remain.
- The mock's HTML, CSS, and JavaScript have been reviewed. Browser rendering and visual comparison will form part of implementation verification.
- This document remains the project roadmap. Current setup and implementation details are maintained in `README.md` and `docs/ADMIN_GUIDE.md`; roadmap items are not automatically evidence of completion.

The finished platform will have three connected experiences:

1. The public website, following the existing mock.
2. Member dashboards for students, mentors, and contributors.
3. An administration system that controls content and manages platform activity.

## 1. Establish the final scope and preserve the design

The mock is the visual reference. It currently uses Aeonik typography, monochrome surfaces, large headings, rounded cards, photography, and a community carousel. Those details take precedence over the older specification's green-and-serif description.

First, inventory every existing section and interaction. Map each requirement to its public page, admin controls, database records, permissions, and acceptance tests.

| What exists now | What the finished platform needs |
| --- | --- |
| Basket stored on the current device | Cart, checkout, payments, and order history |
| Downloadable shopping list | Actual orders and appropriate fulfilment |
| Mentorship request downloaded as text | Submitted requests, matching, and tracked statuses |
| Event interests saved locally | Event registration and admin registration lists |
| Hard-coded leadership rows | Editable sessions, executives, and profile pages |
| Embedded photos and fonts | Managed, optimized assets preserving their appearance |
| Header search filtering store cards | Search across the platform |
| Course cards | Course details, enrolment, and access to learning content |

The mock also contains physical detergents. The store must account for stock and collection or delivery alongside digital downloads and courses.

Deliverables for this stage are a requirements map, screen inventory, workflow descriptions, scope decisions, and acceptance criteria. These should identify launch requirements and future additions explicitly.

**Completion condition:** Every launch requirement has an agreed workflow, and every required screen is identified.

## 2. Choose an architecture suited to the whole platform

The recommendation is Next.js and TypeScript, with Payload as the code-configured administration and content backend, PostgreSQL for data, and private object storage for protected files.

Payload would provide foundations for editing, authentication, and access rules. PANS-specific commerce, course, mentorship, and registration logic would be implemented in application code. Its configuration and the application code would live in the project repository. Payload supports integration with Next.js and PostgreSQL. [Official installation documentation](https://payloadcms.com/docs/getting-started/installation)

| Layer | Planned responsibility |
| --- | --- |
| Next.js frontend | Public pages, account screens, and dashboards |
| Payload backend | Content editing, admin interface, users, and permissions |
| Custom application services | Payments, enrolments, matching, registrations, and fulfilment |
| PostgreSQL | Persistent platform records and relationships |
| Object storage | Images, documents, product files, and course attachments |
| Email service | Verification, resets, receipts, confirmations, and alerts |
| Background jobs | Email retries, reminders, and other deferred work |

Initially, this would be one modular application. Hosting remains undecided; deployment requirements will be documented without tying the implementation to Vercel. Next.js supports self-hosting, so the framework choice does not itself require Vercel. [Self-hosting documentation](https://nextjs.org/docs/app/guides/self-hosting)

Establish the repository structure, local development setup, environment-variable handling, migration process, automated checks, and separate development, staging, and production configuration. Verify mutually supported dependency versions at implementation time.

**Completion condition:** An agreed architecture, supported dependency versions, and a documented development setup.

## 3. Design the database and ownership rules

Important information must become structured records rather than text hidden inside page layouts.

| Area | Main records |
| --- | --- |
| Accounts | Users, profiles, roles, contributor applications, mentor applications |
| Website content | Pages, sections, navigation, site settings, categories, redirects |
| Commerce | Products, variants, carts, orders, order items, payments, download permissions |
| Learning | Courses, modules, lessons, enrolments, lesson progress |
| Mentorship | Mentor profiles, requests, assignments, status history |
| Events | Events, speakers, schedules, registrations |
| Association | Leadership sessions, executive appointments, achievements, projects, milestones |
| Publishing | Resources, articles, opportunities, albums, media |
| Operations | Contact submissions, notifications, background jobs, audit records |

Relationships must enforce ownership. A purchase must belong to the correct customer; a creator's statistics must include only their products; an enrolment must grant access to the correct course.

Financial and historical records must retain meaningful information even when a product is subsequently edited or archived. Order items should retain the relevant purchase-time details. Define constraints, indexes, deletion and archival rules, and transaction boundaries for operations that change multiple related records.

**Completion condition:** Reviewed data models, migrations, validation rules, indexes, and ownership restrictions.

## 4. Build authentication and permissions before private features

Accounts will support registration, email verification, login, logout, password reset, and profile management.

| Role | Intended access |
| --- | --- |
| Administrator | Platform management, configuration, and role assignment |
| PANS Manager | Authorized association content and operational management |
| Mentor | Own profile, assigned requests, and mentees |
| Contributor | Own submissions and permitted performance statistics |
| Student/member | Own purchases, courses, registrations, and mentorship activity |
| Visitor | Published public content |

Users may need multiple roles, such as a student who also contributes resources.

Every private operation will check authorization on the server, including direct API requests and file downloads. Registration must never allow someone to assign themselves an administrative role. Server-side calls must carry the appropriate user context and explicitly enforce the intended access policy. [Access-control documentation](https://payloadcms.com/docs/access-control/overview)

Include staff account protection, secure session handling, session revocation, login throttling, and privileged-action logging. Address administrative multifactor authentication explicitly during authentication design.

Document what personal data is collected, who may access it, and how account deletion requests are handled while preserving records that must be retained under the agreed policy.

**Completion condition:** Automated tests demonstrate that each role can perform its permitted actions and cannot access another person's private records.

## 5. Build the administration and page-editing system

Administrators should be able to maintain the website without editing source code.

| Admin area | What administrators can manage |
| --- | --- |
| Homepage | Hero text, imagery, buttons, statistics, announcements, featured records |
| Page sections | Content, ordering, visibility, and supported layout variants |
| Navigation and footer | Labels, destinations, social links, contact information |
| Products | Descriptions, prices, categories, images, files, stock, publishing |
| Courses | Modules, lessons, attachments, access settings, and enrolments |
| Resources and publishing | Resources, articles, opportunities, categories, and tags |
| Mentorship | Applications, profiles, availability, requests, and assignments |
| Events | Dates, venues, speakers, capacity, registrations, and exports |
| Leadership | Sessions, positions, executives, achievements, and documents |
| Community | Albums, photographs, captions, cover images, and ordering |
| Projects | Descriptions, milestones, progress, and updates |
| Operations | Users, submissions, orders, notifications, and reports |

Page editing will use reusable sections based on the approved design. Admins can compose and update pages using those sections while maintaining a consistent appearance. New component types or new business behaviour would remain development work.

Editing will include drafts, previews, revision history, restoration, and clear publishing controls. Payload provides foundations for versions and draft management; the PANS approval process will be implemented around them. [Versioning documentation](https://payloadcms.com/docs/versions/overview)

Organize the administration interface around actual PANS tasks. Include useful labels, validation messages, filtering, search, and appropriate bulk actions. Financial and access-sensitive operations require their own permissions and audit history.

**Completion condition:** An administrator can update representative content across the site, preview it, publish it, and restore an earlier version.

## 6. Rebuild the mock as the dynamic public website

Reproduce the existing design as reusable application components, preserving its typography, spacing, imagery, navigation treatment, cards, and gallery behaviour.

The homepage will draw its content from the backend. Featured products and mentors can be selected manually; upcoming events and recent resources can populate automatically according to configured rules.

Additional pages absent from the mock will follow the same design language: product details, course pages, event details, mentor profiles, resource listings, accounts, and dashboards.

Extract embedded assets and optimize them for normal delivery and caching. Preserve their intended crop and appearance. Content changes must refresh the relevant public pages without requiring a developer to rebuild them manually.

Include semantic page structure, accessible navigation, meaningful loading and empty states, form feedback, and error pages. Add editable SEO titles and descriptions, social previews, canonical URLs, sitemap generation, and indexing controls where appropriate.

**Completion condition:** The homepage matches the mock closely, displays backend content, and works across the specified screen sizes.

## 7. Implement association content and discovery

This stage covers the public information modules in the specification.

Resources will support categories, student levels, content types, search, filtering, attachments, and external links. News and opportunities will have dedicated listing and detail pages, publishing controls, and appropriate date handling. Opportunity records will include the organization, deadline, eligibility, location, application link, category, and status.

Leadership records will support sessions, executive positions, profiles, achievements, photographs, and documents. Unverified information from the mock will remain clearly marked until confirmed. Support searches by name, session, and position, with a dedicated page for each leadership session.

Galleries will support albums, multiple uploads, captions, ordering, cover images, and accessible full-screen viewing. The computer lab project will have editable milestones, with progress calculated from recorded completion.

About, contact, privacy, terms, and applicable refund information will be editable. Contact submissions will be stored for administrators and generate notifications. Official contact details and social links will come from managed settings.

**Completion condition:** Each module can be created, edited, published, searched where appropriate, and viewed through the public website.

## 8. Build course management and the learning experience

Courses need a defined experience beyond a purchasable card.

The proposed launch baseline is self-paced courses containing modules and lessons. Administrators can manage descriptions, instructors, thumbnails, prices, lesson ordering, text, video references, and downloadable attachments.

Students will be able to enrol in free courses or obtain access through a verified purchase, open their course library, resume learning, and track completed lessons. Progress must persist in the database across devices.

Access checks must protect paid lessons and attachments. Public preview lessons can be enabled deliberately.

If the courses are primarily live workshops, the model should also accommodate schedules, joining instructions, capacity, and attendance. Settle the delivery format before implementing this module.

**Completion condition:** An administrator can publish a course and a student can enrol, access permitted lessons, and retain progress across devices.

## 9. Build the store, checkout, and fulfilment

The catalogue should distinguish digital products, courses, and physical products because each requires different fulfilment.

Customers will browse, filter, view product details, add items to a cart, complete checkout, and see their orders. Prices and totals will be calculated on the server using the current catalogue. Generic mock categories such as e-books must resolve to actual purchasable products with definite prices or variants before checkout.

Paystack is the proposed initial payment integration. Payment confirmation will use authenticated provider notifications and server-side verification. Check the order reference, expected amount, currency, and transaction status before granting value. Duplicate notifications must not fulfil an order twice. [Paystack verification documentation](https://paystack.com/docs/payments/verify-payments/), [webhook documentation](https://paystack.com/docs/payments/webhooks/)

Digital purchases will grant download permissions. Course purchases will grant enrolments. Physical purchases will follow stock and collection or delivery rules.

Protected files will stay in private storage. Downloads will require authorization and use controlled delivery or short-lived links. Storage configuration must preserve those restrictions. [Storage adapter documentation](https://payloadcms.com/docs/upload/storage-adapters)

Administrators will manage orders, payment reconciliation, fulfilment, and refunds according to the agreed policy. Unpaid, failed, cancelled, and refunded orders need explicit handling, including the effect of refunds on access permissions.

Test concurrent stock changes, abandoned checkout, delayed notifications, duplicate notifications, payment mismatches, and fulfilment retries. Payment details handled by the provider should not be stored unnecessarily in the application.

**Completion condition:** Successful and unsuccessful payment scenarios behave correctly, and customers receive only the access or goods associated with their verified order.

## 10. Implement mentorship applications, matching, and tracking

Mentor applications will capture expertise, background, experience, availability, and profile information. Approved profiles become discoverable.

Students will submit requests containing their level, interests, goals, and support needs. Requests will be stored centrally and visible in their account.

The launch version will use admin-assisted matching. Administrators can review requests, assign suitable mentors, and track progress. Mentors can accept or decline according to the agreed workflow.

A typical request will move through submitted, under review, assigned, accepted, and completed states, with declined or cancelled paths where needed. Record who changed a status and when.

Mentor and student dashboards will show the relevant activity. Contact-sharing and any internal notes must have clear visibility rules. Define how availability, mentor capacity, reassignment, and completed mentorships are handled.

**Completion condition:** A student can submit a request, an administrator can assign it, and the assigned mentor and student can track the resulting status.

## 11. Implement events and registration management

Events will support dates, time zones, venue or online details, images, speakers, schedules, registration deadlines, and capacity.

Students can register and receive confirmation. Their dashboard will retain the registration. Administrators can view, search, and export registration records, including the required contact, level, department, and registration information.

The backend must prevent duplicate registrations and handle simultaneous attempts to take the final available places. Cancelled events and registration cancellations need clear outcomes.

Events with dates still to be announced can collect interest separately from confirmed registrations. This preserves the mock's existing concept without presenting an interest save as a booking.

Event status will support upcoming, ongoing, completed, and cancelled states. Completed events can link to relevant galleries and resources.

**Completion condition:** Event creation, registration, capacity enforcement, confirmation, cancellation, and export work together.

## 12. Implement contributor workflows and complete the dashboards

Contributors will apply for access, receive administrative approval, and submit supported products, articles, or resources.

Their content will follow a controlled workflow: draft, pending review, changes requested or approved, published, and archived. Contributors cannot bypass review or edit someone else's submissions.

Published-content changes will also need review rules; approval must not become a route for later unreviewed changes. Record review feedback and notify contributors when action is required.

Contributor dashboards will show submission status and authorized sales or download statistics. Student dashboards will consolidate courses, purchases, downloads, events, mentorship, and profile settings. Mentor dashboards will consolidate requests, mentees, and availability.

Creator revenue sharing and payouts require a separate business decision. Sales reporting does not by itself establish a payout system.

**Completion condition:** The complete contributor journey works, and each dashboard accurately reflects its user's backend records.

## 13. Add operational reliability and test the complete platform

Transactional emails will cover account verification, password reset, orders, registrations, mentorship updates, and moderation decisions. Failed deliveries will be recorded and retried through background jobs. Payload provides a jobs framework suitable for deferred tasks. [Jobs documentation](https://payloadcms.com/docs/jobs-queue/overview)

Implement global search, platform statistics, error monitoring, audit records, backups, and a tested restoration procedure. Search and analytics must respect private data and publishing permissions. Public search should find the supported products, resources, articles, events, mentors, leadership records, and opportunities.

Platform statistics will include the relevant user, mentor, product, download, purchase, registration, and mentorship counts. Define each metric clearly so reports are consistent.

Testing will run throughout development, followed by a complete staging pass.

| Test area | Required evidence |
| --- | --- |
| Functional | Complete student, mentor, contributor, and administrator journeys |
| Permissions | Direct requests cannot bypass role or ownership restrictions |
| Payments | Invalid, duplicate, delayed, failed, and refunded payment scenarios |
| Concurrency | Event capacity, stock, and fulfilment remain consistent |
| Uploads | File type, size, visibility, and access restrictions |
| Content | Drafts remain private; publishing and restoration work |
| Responsive design | Checks at the specification's mobile, tablet, and desktop widths |
| Accessibility | Keyboard use, focus, labels, errors, contrast, and gallery controls |
| Performance | Optimized media, bounded queries, pagination, caching, and mobile loading |
| Recovery | Database and file backups can actually be restored |

Responsive checks will cover at least 320, 375, 390, 414, 768, 1024, and 1440 pixels. Check Chrome, Firefox, Edge, Safari, and representative Android and iPhone devices where available; document any coverage limitations.

Security verification will cover authentication, privilege escalation, unauthorized record access, CSRF, XSS, injection protection, file access, form abuse, and payment verification. Secrets and private records must not appear in frontend bundles, public responses, or ordinary logs.

Particular attention will go to Nigerian mobile connections: smaller images, restrained JavaScript, usable loading states, and recoverable failures. Measure the specification's target of an 80+ mobile PageSpeed score on representative pages where realistically achievable, and document remaining bottlenecks.

**Completion condition:** Agreed acceptance tests pass and launch-blocking defects are resolved.

## 14. Prepare launch, handover, and ongoing maintenance

Hosting selection happens once the application's needs are clear. Evaluate application runtime, database, file storage, background jobs, backups, email, monitoring, and operating costs together.

Development, staging, and production will have separate configuration and data. Production setup will include the organization's domain, HTTPS, organization-owned service accounts, payment configuration, email delivery, backups, and deployment procedures.

Before launch, load verified content, check all navigation and important workflows, confirm recovery procedures, and obtain the owner's review of the working staging application. Document release checks and a rollback procedure before the production deployment.

Handover will include:

- Source repository and all custom application code.
- Setup instructions and database migrations.
- Environment-variable reference and secure credential handover process.
- Content architecture and dependency or integration inventory.
- Admin guide covering content, courses, products, moderation, mentorship, events, users, and reports.
- Deployment, monitoring, backup, restoration, and recovery instructions.
- A complete pre-handover backup.
- Administrator training.

Maintenance will cover dependency updates, security fixes, failed-job monitoring, backup checks, and association leadership transitions. Define responsibility for operating the platform and reviewing service costs after handover.

**Completion condition:** PANS can operate the platform, maintain ownership of its services, and recover from an unsuccessful deployment or data loss.

## Decisions to settle before implementation

These choices do not prevent planning, but they affect implementation scope and acceptance criteria.

| Decision | Proposed starting point |
| --- | --- |
| Course delivery | Self-paced modules and lessons, with live-course support if required |
| Physical products | Stock management and campus collection initially |
| Paid events | Free registration initially unless ticket sales are required |
| Creator payments | Moderated submissions and reporting; agree payout rules separately |
| Membership verification | Email verification, with a separate membership-verification process if needed |
| Mentorship communication | Tracked requests and assignments; agree contact-sharing rules |
| Content migration | Import the mock's content for review; verify names, claims, prices, dates, and asset rights |

Confirm these decisions before assigning a fixed schedule or final operating budget. Each milestone should have an agreed scope and a reviewable completion condition.

## Future additions

Mobile apps, forums, automated mentor matching, certificates, AI assistance, and advanced marketplace payouts can follow the core launch. Keep their likely integration needs in mind without treating them as completed launch features.

Course management remains in the core plan because it was explicitly requested, even though the original specification places a broader digital academy among future features.

## Delivery approach

Development should proceed in reviewable milestones. For each module, complete the database, permissions, admin controls, public interface, and tests together before considering it finished.

The working staging application will be the basis for milestone review. Completion means that the administrator and user journeys work with persistent data and correct permissions, and that the existing mock's visual direction is preserved.
