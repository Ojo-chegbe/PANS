import Link from "next/link";
import { getCMS, mediaURL, getSession } from "@/lib/payload";
import { isStaff, type Actor } from "@/lib/domain";
import { Catalog } from "@/components/Catalog";
import { Archive } from "@/components/Archive";
import { Gallery } from "@/components/Gallery";
import { EventCard, ContentCard } from "@/components/Content";
import { Input, Select, levels } from "@/components/Fields";
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const query = await searchParams;
  const user = await getSession();
  const preview = query.preview === "true" && isStaff(user as Actor | null);
  const payload = await getCMS();
  const [
    home,
    products,
    legacy,
    events,
    photos,
    projects,
    resources,
    articles,
    opportunities,
  ] = await Promise.all([
    payload.findGlobal({
      slug: "home",
      overrideAccess: false,
      draft: preview,
      user: preview ? user : undefined,
    }),
    payload.find({
      collection: "products",
      sort: "displayOrder",
      limit: 30,
      depth: 1,
      overrideAccess: false,
    }),
    payload.find({
      collection: "leadership",
      sort: "-session",
      limit: 100,
      depth: 0,
      overrideAccess: false,
    }),
    payload.find({
      collection: "events",
      sort: "startsAt",
      limit: 4,
      depth: 1,
      where: { eventStatus: { not_equals: "cancelled" } },
      overrideAccess: false,
    }),
    payload.find({
      collection: "photos",
      sort: "position",
      limit: 20,
      depth: 1,
      overrideAccess: false,
    }),
    payload.find({
      collection: "projects",
      limit: 1,
      depth: 0,
      overrideAccess: false,
    }),
    payload.find({
      collection: "resources",
      sort: "-createdAt",
      limit: 3,
      depth: 1,
      overrideAccess: false,
    }),
    payload.find({
      collection: "articles",
      sort: "-createdAt",
      limit: 3,
      depth: 1,
      overrideAccess: false,
    }),
    payload.find({
      collection: "opportunities",
      sort: "-createdAt",
      limit: 3,
      depth: 0,
      overrideAccess: false,
    }),
  ]);
  const hero = home.hero || {};
  const project = projects.docs[0];
  const milestones = project?.milestones || [];
  const completed = milestones.filter((x: any) => x.complete).length;
  return (
    <>
      <div id="top" />
      {preview && (
        <div className="announcement">
          Homepage preview · Unpublished changes are visible only to editors.
        </div>
      )}
      {home.announcement?.visible && (
        <div className="announcement">
          {home.announcement.url ? (
            <Link href={home.announcement.url}>{home.announcement.text}</Link>
          ) : (
            home.announcement.text
          )}
        </div>
      )}
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-intro">
            <div className="hero-eyebrow">
              <span className="dot" />
              {hero.eyebrow}
            </div>
            <h1 className="home-heading">{hero.title}</h1>
            <p className="lede">{hero.description}</p>
            <div className="hero-actions">
              <Link href={hero.primaryURL || "/store"} className="btn-primary">
                {hero.primaryLabel || "Explore the store"}
                <span aria-hidden="true">↗</span>
              </Link>
              <Link
                href={hero.secondaryURL || "/mentorship"}
                className="btn-ghost"
              >
                {hero.secondaryLabel || "Find a mentor"}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            {mediaURL(hero.image) && (
              <img
                className="bg-photo"
                src={(hero.image as any)?.url || mediaURL(hero.image)}
                alt={(hero.image as any)?.alt || "PANS UNIJOS community"}
                fetchPriority="high"
              />
            )}
            <span className="photo-label">
              {hero.photoLabel || "UNIVERSITY OF JOS CHAPTER"}
            </span>
            <div className="hero-caption">
              <h3>{hero.caption}</h3>
              <p>{hero.captionDescription}</p>
              <div className="stat-row">
                {home.stats?.map((stat: any) => (
                  <div className="stat" key={stat.id || stat.label}>
                    <b>{stat.value}</b>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="pathways plain-pathways wrap" aria-label="Quick links">
        {home.pathways?.map((link: any) => (
          <Link key={link.id || link.url} href={link.url}>
            <span>
              <strong>{link.title}</strong>
              <small>{link.description}</small>
            </span>
            <b aria-hidden="true">→</b>
          </Link>
        ))}
      </div>
      {home.sections
        ?.filter((section: any) => section.visible)
        .map((section: any) => {
          const heading = (
            <div className="section-head">
              <div>
                <div className="section-tag">{section.eyebrow}</div>
                <h2>{section.title}</h2>
                {section.description && <p>{section.description}</p>}
              </div>
            </div>
          );
          if (section.kind === "store")
            return (
              <section id="store" key={section.id}>
                <div className="wrap">
                  {heading}
                  <Catalog
                    products={products.docs as any}
                    promos={(home as any).storePromos || []}
                  />
                  <div className="section-actions">
                    <Link className="quiet-link" href="/store">
                      Explore the full store
                    </Link>
                  </div>
                </div>
              </section>
            );
          if (section.kind === "archive")
            return (
              <section id="archive" className="tinted" key={section.id}>
                <div className="wrap">
                  {heading}
                  <Archive records={legacy.docs as any} />
                </div>
              </section>
            );
          if (section.kind === "mentorship")
            return (
              <section
                id="mentorship"
                className="home-mentorship"
                key={section.id}
              >
                <div className="wrap">
                  {heading}
                  <div className="two-col">
                    <div className="col-pad left">
                      <h3>Request a mentor</h3>
                      <p className="form-note">
                        Matched by level and interest — junior to senior, senior
                        to practicing pharmacist.
                      </p>
                      <form action="/mentorship">
                        <Select
                          label="Your level"
                          name="level"
                          options={levels}
                        />
                        <Select
                          label="Area of interest"
                          name="interest"
                          options={[
                            "Academics",
                            "Entrepreneurship",
                            "Technology & Pharma Tech",
                            "Clinical Practice",
                            "Research",
                            "Leadership",
                            "Career Development",
                          ]}
                        />
                        <Input
                          label="Full name"
                          name="name"
                          autoComplete="name"
                          required
                        />
                        <p className="form-note">
                          Tell us what you need. Your request will be reviewed
                          by the PANS team.
                        </p>
                        <button className="match-btn" type="submit">
                          Continue your request{" "}
                          <span aria-hidden="true">→</span>
                        </button>
                      </form>
                    </div>
                    <div className="col-pad" id="lab">
                      <h3 className="project-title">
                        {project?.title || "Computer lab upgrade"}
                      </h3>
                      <p className="form-note">
                        Project roadmap · {completed} of {milestones.length}{" "}
                        milestones complete
                      </p>
                      <div
                        className="lab-progress-bar"
                        role="progressbar"
                        aria-label="Computer lab upgrade progress"
                        aria-valuenow={completed}
                        aria-valuemin={0}
                        aria-valuemax={milestones.length || 1}
                      >
                        <div
                          className="lab-progress-fill"
                          style={{
                            width:
                              (milestones.length
                                ? (completed / milestones.length) * 100
                                : 0) + "%",
                          }}
                        />
                      </div>
                      {milestones.map((milestone: any) => (
                        <div
                          className="lab-step"
                          key={milestone.id || milestone.title}
                        >
                          <div
                            className={
                              "lab-check" + (milestone.complete ? " done" : "")
                            }
                            aria-hidden="true"
                          />
                          <div>
                            <h4>{milestone.title}</h4>
                            <p>{milestone.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            );
          if (section.kind === "events")
            return (
              <section id="summits" className="tinted" key={section.id}>
                <div className="wrap">
                  {heading}
                  <div className="summit-grid">
                    {events.docs.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                  <div className="section-actions">
                    <Link className="quiet-link" href="/events">
                      All events
                    </Link>
                  </div>
                </div>
              </section>
            );
          if (section.kind === "about")
            return (
              <section id="about" key={section.id}>
                <div className="wrap">
                  {heading}
                  <div className="vision-grid">
                    <div>
                      <h3>Vision</h3>
                      <p>{home.vision}</p>
                    </div>
                    <div>
                      <h3>Mission</h3>
                      <p>{home.mission}</p>
                    </div>
                  </div>
                </div>
              </section>
            );
          if (section.kind === "gallery")
            return (
              <section id="gallery" className="gallery-band" key={section.id}>
                <div className="gallery-band-content">
                  <div className="section-tag">{section.eyebrow}</div>
                  <h2>{section.title}</h2>
                  <p>{section.description}</p>
                </div>
                <Gallery photos={photos.docs} />
              </section>
            );
          const collection =
            section.kind === "resources"
              ? resources
              : section.kind === "articles"
                ? articles
                : opportunities;
          return (
            <section key={section.id}>
              <div className="wrap">
                {heading}
                {collection.docs.length ? (
                  <div className="course-grid">
                    {collection.docs.map((doc) => (
                      <ContentCard
                        key={doc.id}
                        doc={doc}
                        section={section.kind}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">
                    New updates will appear here soon.
                  </p>
                )}
                <div className="section-actions">
                  <Link className="quiet-link" href={"/" + section.kind}>
                    View all
                  </Link>
                </div>
              </div>
            </section>
          );
        })}
    </>
  );
}
