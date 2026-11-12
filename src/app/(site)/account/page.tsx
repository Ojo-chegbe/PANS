import Link from "next/link";
import { getCMS, requireSession } from "@/lib/payload";
import { PageIntro } from "@/components/Content";
export const metadata = { title: "Your account" };
export default async function Account() {
  const user = await requireSession();
  const payload = await getCMS();
  const own = { owner: { equals: user.id } };
  const [courses, orders, events, notifications] = await Promise.all([
    payload.count({
      collection: "enrollments",
      where: own,
      overrideAccess: false,
      user,
    }),
    payload.count({
      collection: "orders",
      where: { and: [own, { paymentStatus: { equals: "paid" } }] },
      overrideAccess: false,
      user,
    }),
    payload.count({
      collection: "registrations",
      where: { and: [own, { status: { equals: "confirmed" } }] },
      overrideAccess: false,
      user,
    }),
    payload.find({
      collection: "notifications",
      where: own,
      sort: "-createdAt",
      limit: 5,
      overrideAccess: false,
      user,
    }),
  ]);
  return (
    <>
      <div className="account-welcome">
        <PageIntro
          eyebrow="Your PANS account"
          title={"Welcome, " + user.name.split(" ")[0] + "."}
          description="Your learning, connections, and next steps, all in one place."
        />
        <Link href="/account/profile" className="quiet-link">
          Manage your profile
        </Link>
      </div>
      <div className="account-stats">
        {[
          [courses.totalDocs, "Courses", "/account/courses"],
          [orders.totalDocs, "Purchases", "/account/orders"],
          [events.totalDocs, "Event registrations", "/account/events"],
        ].map(([count, label, url]) => (
          <Link className="account-stat" href={String(url)} key={String(label)}>
            <strong>{count}</strong>
            <span>{label}</span>
          </Link>
        ))}
      </div>
      {!user.level || !user.phone ? (
        <div className="account-profile-prompt">
          <div>
            <h2>A little about you goes a long way.</h2>
            <p>
              Add your details once for easier registrations and mentorship
              requests.
            </p>
          </div>
          <Link className="quiet-link" href="/account/profile">
            Complete your profile
          </Link>
        </div>
      ) : null}
      <div className="account-shortcuts">
        {[
          [
            "Keep learning",
            "Explore practical skills and pick up where you left off.",
            "/store?type=course",
            "Explore courses",
          ],
          [
            "Find your direction",
            "Connect with a mentor who can help with your next step.",
            "/mentorship",
            "Find a mentor",
          ],
          [
            "Be part of it",
            "Discover events and meet people across the community.",
            "/events",
            "Explore events",
          ],
        ].map(([title, description, href, label]) => (
          <Link className="account-shortcut" key={href} href={href}>
            <h2>{title}</h2>
            <p>{description}</p>
            <span>
              {label} <span aria-hidden="true">↗</span>
            </span>
          </Link>
        ))}
      </div>
      <section className="detail-section account-updates">
        <div className="account-section-heading">
          <h2>Recent updates</h2>
          <Link className="quiet-link" href="/account/notifications">
            View all updates
          </Link>
        </div>
        {notifications.docs.length ? (
          notifications.docs.map((doc) => (
            <div className="notification" key={doc.id}>
              <strong>{doc.title}</strong>
              <p>{doc.message}</p>
              {doc.url && (
                <Link className="quiet-link" href={doc.url}>
                  View details
                </Link>
              )}
            </div>
          ))
        ) : (
          <div className="account-caught-up">
            <h3>You’re all caught up.</h3>
            <p>
              Updates about your courses, requests, and events will appear here.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
