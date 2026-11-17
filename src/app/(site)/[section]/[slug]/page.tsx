import Link from "next/link";
import { MediaImage } from "@/components/MediaImage";
import { notFound } from "next/navigation";
import { sections } from "@/lib/sections";
import { bySlug, getSession, list, mediaURL, getCMS } from "@/lib/payload";
import { PageIntro, Body, SafeExternalLink } from "@/components/Content";
import { AddToBasket } from "@/components/Cart";
import { ActionButton, ActionForm } from "@/components/ActionForm";
import { Input, Select, levels } from "@/components/Fields";
import { Gallery } from "@/components/Gallery";
import { money, relationID, isStaff, type Actor } from "@/lib/domain";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; slug: string }>;
}) {
  const { section, slug } = await params;
  const config = sections[section];
  const doc = config ? await bySlug(config.collection, slug) : undefined;
  return {
    title: doc?.seo?.title || doc?.title || "Not found",
    description: doc?.seo?.description || doc?.description,
    robots: doc?.seo?.noIndex ? { index: false, follow: false } : undefined,
  };
}
export default async function Detail({
  params,
}: {
  params: Promise<{ section: string; slug: string }>;
}) {
  const { section, slug } = await params;
  const config = sections[section];
  if (!config) notFound();
  const doc = await bySlug(config.collection, slug);
  if (!doc) notFound();
  const user = await getSession();
  const payload = await getCMS();
  let aside: React.ReactNode = null;
  let extra: React.ReactNode = null;
  if (section === "store") {
    let purchased = false;
    if (user) {
      const grants = await payload.count({
        collection: "entitlements",
        where: {
          and: [
            { owner: { equals: user.id } },
            { product: { equals: doc.id } },
            { active: { equals: true } },
          ],
        },
        overrideAccess: true,
      });
      purchased = grants.totalDocs > 0;
    }
    const courseID = relationID(doc.course);
    const lessons = courseID
      ? await payload.count({
          collection: "lessons",
          where: {
            and: [
              { course: { equals: courseID } },
              { _status: { equals: "published" } },
              { reviewStatus: { equals: "approved" } },
            ],
          },
          overrideAccess: true,
        })
      : null;
    const available =
      doc.salesOpen !== false &&
      (doc.type !== "physical" || doc.stock > 0) &&
      (doc.type !== "course" || Boolean(lessons?.totalDocs));
    aside = (
      <div className="surface detail-aside">
        <span className="meta">
          {doc.type === "course"
            ? "Course"
            : doc.type === "physical"
              ? "Student essentials"
              : "Digital download"}
        </span>
        <span className="price">
          {doc.price === 0 ? "Free" : money(doc.price)}
        </span>
        {purchased ? (
          doc.type === "course" ? (
            <Link
              className="btn-primary"
              href={"/learn/" + (doc.course?.slug || "")}
            >
              Continue learning
            </Link>
          ) : (
            <Link
              prefetch={false}
              className="btn-primary"
              href={"/download/" + doc.id}
            >
              Download your purchase
            </Link>
          )
        ) : available ? (
          <div className="purchase-actions">
            <AddToBasket
              product={{
                id: doc.id,
                title: doc.title,
                price: doc.price,
                type: doc.type,
              }}
              label={doc.price === 0 ? "Add to your library" : "Add to basket"}
            />
            <AddToBasket
              product={{
                id: doc.id,
                title: doc.title,
                price: doc.price,
                type: doc.type,
              }}
              buyNow
              label={doc.price === 0 ? "Get it now" : "Buy now"}
            />
          </div>
        ) : (
          <div className="purchase-unavailable">
            <button className="buy-btn-sm" type="button" disabled>
              {doc.type === "physical" && !(doc.stock > 0)
                ? "Out of stock"
                : doc.type === "course"
                  ? "Enrolment opens soon"
                  : "Available soon"}
            </button>
            <p className="form-note">
              {doc.type === "physical"
                ? "This item is not available to order yet. Please check back for stock updates."
                : "Purchasing will open when the learning content or download is ready."}
            </p>
          </div>
        )}
        <p className="form-note">
          {doc.type === "physical"
            ? "Campus collection. The PANS team will notify you when your order is ready."
            : doc.type === "course"
              ? "Course access is saved in your account after confirmation."
              : "Your download is delivered securely through your account."}
        </p>
        <dl className="detail-list">
          <dt>Category</dt>
          <dd>{doc.category || "General"}</dd>
          <dt>By</dt>
          <dd>{doc.owner?.name || "PANS UNIJOS"}</dd>
        </dl>
      </div>
    );
    if (courseID) {
      const course =
        typeof doc.course === "object"
          ? doc.course
          : await payload.findByID({
              collection: "courses",
              id: courseID,
              overrideAccess: false,
            });
      const outline = await payload.find({
        collection: "lessons",
        where: {
          and: [
            { course: { equals: courseID } },
            { _status: { equals: "published" } },
            { reviewStatus: { equals: "approved" } },
          ],
        },
        limit: 200,
        depth: 0,
        overrideAccess: true,
        select: {
          title: true,
          module: true,
          position: true,
          preview: true,
          slug: true,
        },
      });
      extra = (
        <section className="detail-section">
          <h2>What you will learn</h2>
          <Body data={course.content} />
          {outline.docs.length > 0 ? (
            <div className="record-list">
              {outline.docs
                .sort((a, b) => (a.position || 0) - (b.position || 0))
                .map((lesson) => (
                  <div className="record-card" key={lesson.id}>
                    <span className="meta">
                      {lesson.module || "Course lesson"}
                    </span>
                    <h3>{lesson.title}</h3>
                    {lesson.preview && (
                      <Link
                        className="quiet-link"
                        href={"/learn/" + course.slug + "?lesson=" + lesson.id}
                      >
                        Preview lesson
                      </Link>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <p className="form-note">The course outline is being prepared.</p>
          )}
        </section>
      );
    }
  } else if (section === "events") {
    const registrations = await payload.count({
      collection: "registrations",
      where: {
        and: [
          { event: { equals: doc.id } },
          { status: { equals: "confirmed" } },
        ],
      },
      overrideAccess: true,
    });
    const soldOut = doc.capacity && registrations.totalDocs >= doc.capacity;
    const closed =
      (doc.registrationDeadline &&
        new Date(doc.registrationDeadline) < new Date()) ||
      ["cancelled", "completed"].includes(doc.eventStatus);
    aside = (
      <div className="surface detail-aside">
        <h2>
          {doc.eventStatus === "announced"
            ? "Stay in the loop."
            : "Join the conversation."}
        </h2>
        <dl className="detail-list">
          <dt>Date</dt>
          <dd>
            {doc.startsAt
              ? new Date(doc.startsAt).toLocaleDateString("en-NG", {
                  dateStyle: "long",
                  timeZone: "Africa/Lagos",
                })
              : "To be announced"}
          </dd>
          {doc.startsAt && (
            <>
              <dt>Time</dt>
              <dd>
                {new Date(doc.startsAt).toLocaleTimeString("en-NG", {
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: "Africa/Lagos",
                })}{" "}
                WAT
              </dd>
            </>
          )}
          <dt>Venue</dt>
          <dd>{doc.venue || "To be announced"}</dd>
          <dt>Format</dt>
          <dd>{doc.mode}</dd>
        </dl>
        {doc.eventStatus === "announced" ? (
          <div className="section-actions">
            <ActionButton
              action="event-interest"
              data={{ event: doc.id }}
              className="btn-primary"
            >
              Save to my interests
            </ActionButton>
            <p className="form-note">
              Saved to your account so you can find it again.
            </p>
          </div>
        ) : closed || soldOut ? (
          <p className="form-note">
            {soldOut
              ? "This event is fully booked."
              : "Registration is closed."}
          </p>
        ) : (
          <div className="section-actions">
            <ActionForm
              action="register-event"
              extra={{ event: doc.id }}
              submit="Confirm your registration"
              pending="Reserving your place…"
              authRequired
              signedIn={Boolean(user)}
            >
              <Input
                label="Phone number"
                name="phone"
                type="tel"
                autoComplete="tel"
                defaultValue={user?.phone || ""}
              />
              <Select
                label="Your level"
                name="level"
                options={levels}
                defaultValue={user?.level || "100L"}
              />
              <Input
                label="Department"
                name="department"
                defaultValue={user?.department || "Pharmacy"}
                required
              />
              <label className="check-field">
                <input
                  type="checkbox"
                  name="membership"
                  defaultChecked={user?.membershipVerified || false}
                />
                I am a PANS member
              </label>
            </ActionForm>
          </div>
        )}
      </div>
    );
    extra = (
      <>
        {doc.speakers?.length > 0 && (
          <section className="detail-section">
            <h2>Speakers</h2>
            {doc.speakers.map((speaker: any) => (
              <p key={speaker.id}>
                <strong>{speaker.name}</strong>
                {speaker.position ? " · " + speaker.position : ""}
              </p>
            ))}
          </section>
        )}
        {doc.schedule?.length > 0 && (
          <section className="detail-section">
            <h2>Programme</h2>
            {doc.schedule.map((item: any) => (
              <div className="search-result" key={item.id}>
                <span className="meta">{item.time}</span>
                <p>{item.activity}</p>
              </div>
            ))}
          </section>
        )}
      </>
    );
  } else if (section === "resources") {
    aside = (
      <div className="surface detail-aside">
        <h2>A resource for you.</h2>
        <p className="meta">{doc.resourceType}</p>
        {doc.file && (
          <Link
            className="btn-primary"
            href={"/resources/" + doc.slug + "/download"}
            prefetch={false}
          >
            Download resource
          </Link>
        )}
        {doc.url && (
          <SafeExternalLink url={doc.url}>Open resource</SafeExternalLink>
        )}
        <div className="section-actions">
          <ActionButton action="bookmark" data={{ resource: doc.id }}>
            Save to my resources
          </ActionButton>
        </div>
      </div>
    );
  } else if (section === "opportunities")
    aside = (
      <div className="surface detail-aside">
        <h2>Take your next step.</h2>
        <dl className="detail-list">
          <dt>Organization</dt>
          <dd>{doc.organization || "See opportunity"}</dd>
          <dt>Deadline</dt>
          <dd>
            {doc.deadline
              ? new Date(doc.deadline).toLocaleDateString("en-NG", {
                  dateStyle: "long",
                })
              : "See application details"}
          </dd>
          <dt>Location</dt>
          <dd>{doc.location || "See application details"}</dd>
        </dl>
        {doc.eligibility && <p className="form-note">{doc.eligibility}</p>}
        <div className="section-actions">
          {!doc.deadline || new Date(doc.deadline) > new Date() ? (
            <SafeExternalLink url={doc.url}>
              View application details
            </SafeExternalLink>
          ) : (
            <p className="form-note">
              The listed application deadline has passed.
            </p>
          )}
        </div>
      </div>
    );
  else if (section === "mentors")
    aside = (
      <div className="surface detail-aside">
        <h2>Find your next step.</h2>
        <p>{doc.position}</p>
        <p className="form-note">{doc.expertise?.join(" · ")}</p>
        <span className="status">{doc.availability}</span>
        <div className="section-actions">
          {doc.availability !== "unavailable" && (
            <Link className="btn-primary" href={"/mentorship?mentor=" + doc.id}>
              Request mentorship
            </Link>
          )}
        </div>
        {doc.linkedin && (
          <div className="section-actions">
            <SafeExternalLink url={doc.linkedin}>
              LinkedIn profile
            </SafeExternalLink>
          </div>
        )}
      </div>
    );
  else if (section === "legacy") {
    extra = (
      <>
        {!doc.verified && (
          <p className="form-feedback">
            Historical details for this session are awaiting verification.
          </p>
        )}
        {doc.vision && (
          <section className="detail-section">
            <h2>Vision</h2>
            <p>{doc.vision}</p>
          </section>
        )}
        {doc.executives?.length > 0 && (
          <section className="detail-section">
            <h2>The executive team</h2>
            <div className="record-list">
              {doc.executives.map((person: any) => (
                <div className="record-card" key={person.id}>
                  <span className="meta">{person.position}</span>
                  <h3>{person.name}</h3>
                </div>
              ))}
            </div>
          </section>
        )}
        {doc.achievements?.length > 0 && (
          <section className="detail-section">
            <h2>Achievements</h2>
            {doc.achievements.map((item: any) => (
              <p key={item.id}>{item.text}</p>
            ))}
          </section>
        )}
      </>
    );
  } else if (section === "community") {
    const photos = await list("photos", {
      where: { album: { equals: doc.id } },
      sort: "position",
      limit: 100,
    });
    extra = (
      <section id="gallery" className="gallery-band" style={{ padding: 0 }}>
        <Gallery photos={photos.docs} />
      </section>
    );
  }
  return (
    <div className="wrap page-shell">
      <Link href={"/" + section} className="back-link">
        Back to {section === "store" ? "the store" : section}
      </Link>
      <div className={aside ? "detail-layout" : ""}>
        <article>
          <PageIntro
            eyebrow={doc.category || doc.session || config.eyebrow}
            title={doc.title}
            description={doc.description}
          />
          {section !== "community" && mediaURL(doc.image) && (
            <MediaImage
              className="detail-image"
              image={doc.image}
              sizes="(max-width: 900px) 100vw, 860px"
              loading="eager"
              alt={doc.image?.alt || ""}
            />
          )}
          <Body data={doc.content} />
          {extra}
        </article>
        {aside}
      </div>
    </div>
  );
}
