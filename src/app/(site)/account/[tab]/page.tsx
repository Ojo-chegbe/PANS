import Link from "next/link";
import { notFound } from "next/navigation";
import { getCMS, requireSession, mediaURL } from "@/lib/payload";
import { PageIntro, ContentCard } from "@/components/Content";
import { ActionButton, ActionForm } from "@/components/ActionForm";
import { Input, Select, Textarea, levels } from "@/components/Fields";
import { money, relationID, type RecordData } from "@/lib/domain";
const titles: Record<string, string> = {
  courses: "My courses",
  resources: "My resources",
  orders: "My orders",
  mentorship: "Mentorship",
  events: "My events",
  contributions: "Contributions",
  profile: "Your profile",
  "mentor-profile": "Your mentor profile",
  notifications: "Your updates",
};
const descriptions: Record<string, string> = {
  courses: "Your next lesson is a step forward. Pick up where you left off.",
  resources: "The useful things you’ve saved, ready when you need them.",
  orders: "Your purchases, payment details, and collection updates.",
  mentorship:
    "Keep track of your requests and the people supporting your journey.",
  events: "Your registrations and the events you’re interested in.",
  contributions:
    "Follow your applications, submissions, and feedback from the team.",
  profile:
    "Keep your details up to date so the community can support you better.",
  "mentor-profile":
    "Help students understand your experience and how you can support them.",
  notifications: "The latest on your learning, connections, and activity.",
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tab: string }>;
}) {
  return { title: titles[(await params).tab] || "Your account" };
}
export default async function AccountTab({
  params,
  searchParams,
}: {
  params: Promise<{ tab: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { tab } = await params;
  if (!titles[tab]) notFound();
  const user = await requireSession();
  const payload = await getCMS();
  const own = { owner: { equals: user.id } };
  const page = Math.max(1, Number((await searchParams).page) || 1);
  let content: React.ReactNode;
  let result: any;
  if (tab === "profile")
    content = (
      <div className="surface profile-surface">
        <div className="account-form-heading">
          <h2>Personal details</h2>
          <p>These details are used for your registrations and requests.</p>
        </div>
        <ActionForm action="profile">
          <div className="profile-fields">
            <Input
              label="Full name"
              name="name"
              defaultValue={user.name}
              required
            />
            <Input
              label="Email address"
              name="email"
              type="email"
              value={user.email}
              readOnly
            />
            <Input
              label="Phone number"
              name="phone"
              type="tel"
              defaultValue={user.phone || ""}
            />
            <Select
              label="Your level"
              name="level"
              options={levels}
              defaultValue={user.level || "100L"}
            />
            <Input
              label="Department"
              name="department"
              defaultValue={user.department || "Pharmacy"}
              required
            />
            <Textarea
              label="A little about you"
              name="bio"
              defaultValue={user.bio || ""}
              maxLength={1500}
            />
          </div>
        </ActionForm>
        <p className="form-note">
          For help changing your email or deleting your account,{" "}
          <Link className="quiet-link" href="/contact">
            contact the PANS team
          </Link>
          .
        </p>
        <Link className="quiet-link" href="/forgot-password">
          Reset your password
        </Link>
      </div>
    );
  else if (tab === "mentor-profile") {
    if (!user.roles?.includes("mentor")) notFound();
    const mentor = await payload.find({
      collection: "mentors",
      where: own,
      limit: 1,
      overrideAccess: true,
    });
    const doc = mentor.docs[0];
    content = doc ? (
      <div className="surface">
        <ActionForm action="mentor-profile">
          <Input
            label="Current role"
            name="position"
            defaultValue={doc.position || ""}
          />
          <Textarea
            label="Your profile"
            name="description"
            defaultValue={doc.description}
            minLength={20}
            required
          />
          <Input
            label="Areas of expertise, separated by commas"
            name="expertise"
            defaultValue={doc.expertise?.join(", ") || ""}
          />
          <Select
            label="Availability"
            name="availability"
            options={["available", "limited", "unavailable"]}
            defaultValue={doc.availability || "available"}
          />
        </ActionForm>
      </div>
    ) : (
      <p className="empty-state">Your profile is being prepared.</p>
    );
  } else if (tab === "courses") {
    result = await payload.find({
      collection: "enrollments",
      where: own,
      sort: "-createdAt",
      depth: 1,
      limit: 24,
      page,
      overrideAccess: false,
      user,
    });
    content = result.docs.length ? (
      <div className="record-list">
        {result.docs.map((doc: any) => (
          <div className="record-card" key={doc.id}>
            <h2>{doc.course?.title || "Course"}</h2>
            <p>{doc.course?.description}</p>
            <Link className="btn-primary" href={"/learn/" + doc.course?.slug}>
              Continue learning
            </Link>
          </div>
        ))}
      </div>
    ) : (
      <Empty
        text="Your courses will be waiting here after you enrol."
        href="/store?type=course"
        label="Explore courses"
      />
    );
  } else if (tab === "resources") {
    result = await payload.find({
      collection: "bookmarks",
      where: own,
      sort: "-createdAt",
      depth: 2,
      limit: 24,
      page,
      overrideAccess: false,
      user,
    });
    content = result.docs.length ? (
      <div className="course-grid">
        {result.docs
          .filter(
            (doc: any) => typeof doc.resource === "object" && doc.resource,
          )
          .map((doc: any) => (
            <ContentCard key={doc.id} doc={doc.resource} section="resources" />
          ))}
      </div>
    ) : (
      <Empty
        text="Keep useful resources close. Save a resource to find it here."
        href="/resources"
        label="Explore resources"
      />
    );
  } else if (tab === "orders") {
    result = await payload.find({
      collection: "orders",
      where: own,
      sort: "-createdAt",
      depth: 0,
      limit: 24,
      page,
      overrideAccess: false,
      user,
    });
    content = result.docs.length ? (
      <div className="record-list">
        {result.docs.map((doc: any) => (
          <div className="record-card" key={doc.id}>
            <div className="record-top">
              <div>
                <h2>{doc.items?.map((item: any) => item.title).join(", ")}</h2>
                <span className="meta">
                  {new Date(doc.createdAt).toLocaleDateString("en-NG", {
                    dateStyle: "long",
                  })}
                </span>
              </div>
              <span className="status">
                {doc.paymentStatus.replaceAll("-", " ")}
              </span>
            </div>
            <p>{money(doc.total)}</p>
            <Link className="quiet-link" href={"/account/orders/" + doc.id}>
              View order
            </Link>
          </div>
        ))}
      </div>
    ) : (
      <Empty
        text="Your purchases and downloads will appear here."
        href="/store"
        label="Explore the store"
      />
    );
  } else if (tab === "events") {
    result = await payload.find({
      collection: "registrations",
      where: own,
      sort: "-createdAt",
      depth: 1,
      limit: 24,
      page,
      overrideAccess: false,
      user,
    });
    const interests = await payload.find({
      collection: "event-interests",
      where: own,
      sort: "-createdAt",
      depth: 1,
      limit: 24,
      overrideAccess: false,
      user,
    });
    content = (
      <>
        {result.docs.length ? (
          <div className="record-list">
            {result.docs.map((doc: any) => (
              <div className="record-card" key={doc.id}>
                <div className="record-top">
                  <h2>{doc.event?.title || "Event"}</h2>
                  <span className="status">{doc.status}</span>
                </div>
                <p>
                  {doc.event?.startsAt
                    ? new Date(doc.event.startsAt).toLocaleDateString("en-NG", {
                        dateStyle: "long",
                      })
                    : "Date to be announced"}
                </p>
                <div className="record-actions">
                  <Link href={"/events/" + doc.event?.slug}>Event details</Link>
                  {doc.status === "confirmed" && (
                    <ActionButton
                      action="cancel-registration"
                      data={{ id: doc.id }}
                      confirm="Cancel your registration for this event?"
                    >
                      Cancel registration
                    </ActionButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            text="Your confirmed registrations will appear here."
            href="/events"
            label="Find an event"
          />
        )}
        {interests.docs.length > 0 && (
          <section className="detail-section">
            <h2>Saved interests</h2>
            <div className="record-list">
              {interests.docs.map((doc: any) => (
                <div className="record-card" key={doc.id}>
                  <h3>{doc.event?.title || "Event"}</h3>
                  <Link
                    className="quiet-link"
                    href={"/events/" + doc.event?.slug}
                  >
                    View event
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </>
    );
  } else if (tab === "mentorship") {
    result = await payload.find({
      collection: "mentorship-requests",
      where: user.roles?.includes("mentor")
        ? { or: [own, { assignedMentor: { equals: user.id } }] }
        : own,
      sort: "-createdAt",
      depth: 1,
      limit: 24,
      page,
      overrideAccess: false,
      user,
    });
    content = result.docs.length ? (
      <div className="record-list">
        {result.docs.map((doc: any) => {
          const assigned =
            String(relationID(doc.assignedMentor)) === String(user.id);
          return (
            <div className="record-card" key={doc.id}>
              <div className="record-top">
                <div>
                  <span className="meta">
                    {assigned ? "Mentee request" : "Your request"}
                  </span>
                  <h2>{doc.interest}</h2>
                </div>
                <span className="status">
                  {doc.status.replaceAll("-", " ")}
                </span>
              </div>
              <p>{doc.message}</p>
              {assigned && (
                <p>
                  {doc.name} · {doc.level}
                </p>
              )}
              {doc.assignedMentor?.name && (
                <p>Mentor: {doc.assignedMentor.name}</p>
              )}
              <div className="record-actions">
                {assigned && doc.status === "assigned" && (
                  <>
                    <ActionButton
                      action="mentorship-status"
                      data={{ id: doc.id, status: "accepted" }}
                    >
                      Accept request
                    </ActionButton>
                    <ActionButton
                      action="mentorship-status"
                      data={{ id: doc.id, status: "declined" }}
                    >
                      Decline request
                    </ActionButton>
                  </>
                )}
                {assigned && doc.status === "accepted" && (
                  <ActionButton
                    action="mentorship-status"
                    data={{ id: doc.id, status: "completed" }}
                  >
                    Mark as completed
                  </ActionButton>
                )}
                {!assigned &&
                  ["submitted", "under-review", "assigned"].includes(
                    doc.status,
                  ) && (
                    <ActionButton
                      action="mentorship-status"
                      data={{ id: doc.id, status: "cancelled" }}
                      confirm="Cancel this mentorship request?"
                    >
                      Cancel request
                    </ActionButton>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <Empty
        text="A little guidance can make all the difference."
        href="/mentorship"
        label="Request a mentor"
      />
    );
  } else if (tab === "notifications") {
    result = await payload.find({
      collection: "notifications",
      where: own,
      sort: "-createdAt",
      limit: 24,
      page,
      overrideAccess: false,
      user,
    });
    content = result.docs.length ? (
      <div className="record-list">
        {result.docs.map((doc: any) => (
          <div className="record-card" key={doc.id}>
            <span className="meta">
              {new Date(doc.createdAt).toLocaleDateString("en-NG")}
            </span>
            <h2>{doc.title}</h2>
            <p>{doc.message}</p>
            <div className="record-actions">
              {doc.url && <Link href={doc.url}>View details</Link>}
              {!doc.readAt && (
                <ActionButton action="read-notification" data={{ id: doc.id }}>
                  Mark as read
                </ActionButton>
              )}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="empty-state">Your updates will appear here.</p>
    );
  } else {
    const [mentor, contributor, ...submissions] = await Promise.all([
      payload.find({
        collection: "mentor-applications",
        where: own,
        limit: 10,
        overrideAccess: false,
        user,
      }),
      payload.find({
        collection: "contributor-applications",
        where: own,
        limit: 10,
        overrideAccess: false,
        user,
      }),
      ...(["products", "resources", "articles"] as const).map((collection) =>
        payload.find({
          collection,
          where: own,
          limit: 50,
          overrideAccess: false,
          user,
          draft: true,
        }),
      ),
    ]);
    const productIDs = (submissions[0].docs as RecordData[]).map(
      (doc) => doc.id,
    );
    let sales = 0,
      downloads = 0;
    if (productIDs.length) {
      const [orders, downloadCount] = await Promise.all([
        payload.find({
          collection: "orders",
          where: {
            and: [
              { paymentStatus: { equals: "paid" } },
              { "items.product": { in: productIDs } },
            ],
          },
          limit: 10000,
          depth: 0,
          select: { items: true },
          overrideAccess: true,
        }),
        payload.count({
          collection: "downloads",
          where: { product: { in: productIDs } },
          overrideAccess: true,
        }),
      ]);
      sales = orders.docs.reduce(
        (sum, order) =>
          sum +
          (order.items || [])
            .filter((item) => productIDs.includes(relationID(item.product)!))
            .reduce((units, item) => units + item.quantity, 0),
        0,
      );
      downloads = downloadCount.totalDocs;
    }
    content = (
      <>
        {user.roles?.includes("contributor") && (
          <div className="account-stats">
            <div className="account-stat">
              <strong>{submissions[0].totalDocs}</strong>
              <span>Your products</span>
            </div>
            <div className="account-stat">
              <strong>{sales}</strong>
              <span>Product orders</span>
            </div>
            <div className="account-stat">
              <strong>{downloads}</strong>
              <span>Downloads</span>
            </div>
          </div>
        )}
        <div className="form-links">
          <Link className="btn-primary" href="/contribute">
            {user.roles?.includes("contributor")
              ? "Create a submission"
              : "Apply to contribute"}
          </Link>
          <Link className="btn-ghost" href="/contribute?kind=mentor">
            Apply to mentor
          </Link>
        </div>
        <section className="detail-section">
          <h2>Applications</h2>
          {[
            ...mentor.docs.map((doc) => ({ ...doc, kind: "Mentor" })),
            ...contributor.docs.map((doc) => ({ ...doc, kind: "Contributor" })),
          ].map((doc) => (
            <div className="notification" key={doc.kind + doc.id}>
              <strong>{doc.kind} application</strong>{" "}
              <span className="status">{doc.status}</span>
              {doc.reviewNotes && <p>{doc.reviewNotes}</p>}
            </div>
          ))}
        </section>
        <section className="detail-section">
          <h2>Your submissions</h2>
          {submissions.some((x) => x.docs.length) ? (
            <div className="record-list">
              {submissions.flatMap((result, index) =>
                result.docs.map((doc: any) => (
                  <div className="record-card" key={index + ":" + doc.id}>
                    <span className="meta">
                      {["Product", "Resource", "Article"][index]}
                    </span>
                    <div className="record-top">
                      <h3>{doc.title}</h3>
                      <span className="status">
                        {doc.reviewStatus?.replaceAll("-", " ")}
                      </span>
                    </div>
                    <p>{doc.description}</p>
                    {doc.reviewNotes && <p>{doc.reviewNotes}</p>}
                    {["draft", "changes-requested"].includes(
                      doc.reviewStatus,
                    ) && (
                      <Link
                        className="quiet-link"
                        href={
                          "/account/contributions/" +
                          ["products", "resources", "articles"][index] +
                          "/" +
                          doc.id
                        }
                      >
                        Edit and resubmit
                      </Link>
                    )}
                  </div>
                )),
              )}
            </div>
          ) : (
            <p className="empty-state">
              Your submissions will appear here once you start contributing.
            </p>
          )}
        </section>
      </>
    );
  }
  return (
    <>
      <PageIntro
        eyebrow="Your PANS account"
        title={titles[tab]}
        description={descriptions[tab]}
      />
      {content}
      {result?.totalPages > 1 && (
        <div className="pagination">
          <span>
            Page {result.page} of {result.totalPages}
          </span>
          <span>
            {result.hasPrevPage && (
              <Link href={"/account/" + tab + "?page=" + (page - 1)}>
                Previous
              </Link>
            )}{" "}
            {result.hasNextPage && (
              <Link href={"/account/" + tab + "?page=" + (page + 1)}>Next</Link>
            )}
          </span>
        </div>
      )}
    </>
  );
}
function Empty({
  text,
  href,
  label,
}: {
  text: string;
  href: string;
  label: string;
}) {
  return (
    <div className="empty-state">
      <h2>Make your next move.</h2>
      <p>{text}</p>
      <Link className="quiet-link" href={href}>
        {label}
      </Link>
    </div>
  );
}
