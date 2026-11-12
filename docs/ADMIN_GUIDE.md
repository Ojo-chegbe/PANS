# PANS Digital Hub administration guide

## Access and roles

Open `/admin` and sign in with an administrator or PANS Manager account. Administrator access is provisioned with `npm run admin:create -- email@example.com`. Students, mentors, and contributors use their account dashboard rather than the administrative content interface.

Administrators manage role assignments. PANS Managers manage authorized content and platform operations without being able to assign administrator privileges.

## Update the website

Use **Homepage** to edit the hero, imagery, calls to action, counters, quick links, section headings, section order, visibility, vision, mission, and store promotion cards. Save a draft, preview it, then publish it. Use version history to inspect or restore an earlier revision.

Use **Site settings** for navigation, footer links, social links, contact information, collection instructions, and page introductions. Use **Pages** for editable information pages and supported content blocks. Keep page layouts within the existing design system.

## Add courses

Create a course under **Learning**, then add its lessons. Associate each lesson with the course, set its module and position, and add text, approved video content, or protected attachments. Use a protected video file for content that must require enrolment. Publish the course and the lessons when they are ready.

For a paid course, create a course-type product and link it to the course. Set the price in kobo: NGN 2,500 is 250000 kobo. Enable sales only after the learning content is ready. For a free course, enable the course's free-enrolment setting.

## Add digital and physical products

Upload product imagery to **Media**. Upload saleable documents to **Files** with private visibility. Create a product, choose its type, description, category, and price, then attach the protected file or associated course. Physical products also need an accurate stock quantity. Enable sales when fulfilment is ready.

A paid file must not be reused as a freely accessible resource file. The product publication checks reject a file with member-wide visibility.

## Review contributions

Open the relevant products, resources, or articles collection and filter by review status. Review content and ownership, request changes where needed, or approve and publish it. Contributors cannot publish their own submissions. Applications for contributor access are managed under **People**.

Use the review notes field to explain requested changes. Contributors can read those notes, revise their own draft through **My contributions**, and resubmit it for review. Their dashboard also shows purchase and download counts for their own submissions.

## Manage mentorship

Review mentor applications under **People**. Approval grants the mentor role and creates a profile. Check the public profile and availability before publishing changes.

Open **Mentorship requests** to review the student's interests and message. Assign an approved mentor's user account and set the request status to assigned. The mentor accepts or declines through their dashboard. Internal administration notes are restricted to staff.

## Create events and export registrations

Create an event with its description, format, venue, dates, registration deadline, capacity, speakers, and programme. Announced events collect interest; upcoming events with dates can accept registrations. Set completed or cancelled status when appropriate.

Open the event's registration export link to download CSV, or visit `/api/export/registrations?event=EVENT_ID` while signed in as staff. Exports are not public. Registrations can also be viewed and filtered in administration.

## Manage leadership, galleries, and projects

Create or edit leadership sessions, presidents, executives, achievements, and supporting content. Mark records verified only after checking their source.

Create an album, then add photos with captions and positions. Album ordering and image descriptions should remain meaningful for keyboard and screen-reader users.

Update project milestones as work progresses. Homepage project completion is derived from milestone completion.

## Resources, news, and opportunities

Create the appropriate record, set its category and other filters, review the content, and publish it. Resources support student levels and content types. Opportunities should include a valid application link, eligibility, organization, location, and deadline.

## Orders and support

Orders show immutable purchase-time prices, payment state, and fulfilment state. Payment is confirmed by the provider-verification workflow. Do not represent a frontend callback or customer screenshot as confirmed payment.

For physical orders, update collection readiness and fulfilment. Review contact submissions for account, purchase, membership, and deletion requests. Follow the agreed refund and record-retention policies.

Administrators can request a full Paystack refund from a paid order. Access is removed only after the provider confirms that the refund was processed. Repeating the request does not create another refund. Orders flagged as needing attention require staff review, including payments received after a stock reservation expired.

## Notifications and maintenance

Keep the job worker running so transactional email can be delivered and retried. Check failed jobs and delivery errors. Local development email is captured in `.data/mail` when SMTP is absent.

Use the backup command in the README before schema changes or major imports. Its `-Verify` option restores the dump into a temporary database and checks record counts. Deployment still needs scheduled off-site backups, monitoring, and a documented recovery owner.

Before production launch, finish the operating decisions and acceptance checks in the project plan, verify backups and restoration, and ensure all service accounts belong to PANS.
