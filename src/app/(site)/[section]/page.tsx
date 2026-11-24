import Link from "next/link";
import { MediaImage } from "@/components/MediaImage";
import { notFound } from "next/navigation";
import { sections } from "@/lib/sections";
import { list, bySlug, getCMS, pageIntro } from "@/lib/payload";
import { PageIntro, ContentCard, EventCard, Body } from "@/components/Content";
import { ProductCard } from "@/components/Catalog";
import { Archive } from "@/components/Archive";
import { MentorDirectory } from "@/components/MentorDirectory";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!sections[section]) {
    const page = await bySlug("pages", section);
    return {
      title: page?.seo?.title || page?.title || section,
      description: page?.seo?.description || page?.description,
      robots: page?.seo?.noIndex ? { index: false, follow: false } : undefined,
    };
  }
  const intro = sections[section]
    ? await pageIntro(section, sections[section])
    : null;
  return { title: intro?.title.replaceAll("\n", " ") || section };
}
export default async function Listing({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { section } = await params;
  const query = await searchParams;
  const base = sections[section];
  const config = base
    ? { ...base, ...(await pageIntro(section, base)) }
    : undefined;
  if (!config) {
    const page = await bySlug("pages", section);
    if (!page) notFound();
    return (
      <div className="wrap page-shell">
        <PageIntro title={page.title} description={page.description} />
        <Body data={page.content} />
        {page.blocks?.map((block: any, i: number) =>
          block.blockType === "text" ? (
            <section className="detail-section" key={block.id || i}>
              <h2>{block.heading}</h2>
              <Body data={block.body} />
            </section>
          ) : block.blockType === "image" ? (
            <figure key={block.id || i}>
              <MediaImage
                className="detail-image"
                image={block.image}
                sizes="(max-width: 1200px) 100vw, 1200px"
                alt={block.image?.alt || ""}
              />
              <figcaption>{block.caption}</figcaption>
            </figure>
          ) : block.blockType === "links" ? (
            <section key={block.id || i} className="detail-section">
              <h2>{block.heading}</h2>
              {block.items?.map((link: any) => (
                <p key={link.url}>
                  <Link className="quiet-link" href={link.url}>
                    {link.label}
                  </Link>
                </p>
              ))}
            </section>
          ) : null,
        )}
      </div>
    );
  }
  if (section === "mentors")
    return <MentorDirectory query={query} intro={config} />;
  const page = Math.max(1, Math.min(Number(query.page) || 1, 10000));
  const where: any = { and: [] };
  if (query.q)
    where.and.push({
      or: [
        { title: { like: query.q.slice(0, 150) } },
        { description: { like: query.q.slice(0, 150) } },
      ],
    });
  if (query.category)
    where.and.push({ category: { equals: query.category.slice(0, 100) } });
  if (section === "resources" && query.level)
    where.and.push({ level: { contains: query.level } });
  if (section === "resources" && query.type)
    where.and.push({ resourceType: { equals: query.type } });
  if (section === "store" && query.type)
    where.and.push({ type: { equals: query.type } });
  const result = await list(config.collection, {
    // Cards do not render full rich-text articles or course descriptions.
    select: { content: false },
    where: where.and.length ? where : {},
    sort:
      section === "legacy"
        ? "-session"
        : section === "store"
          ? "displayOrder"
          : "-createdAt",
    limit: section === "legacy" ? 100 : 24,
    page,
  });
  const link = (target: number) => {
    const search = new URLSearchParams(
      Object.entries(query).filter((entry): entry is [string, string] =>
        Boolean(entry[1]),
      ),
    );
    search.set("page", String(target));
    return "/" + section + "?" + search.toString();
  };
  return (
    <div className="wrap page-shell">
      <PageIntro {...config} />
      {section === "legacy" ? (
        <Archive records={result.docs as any} />
      ) : (
        <>
          <form className="list-controls" role="search">
            <label className="sr-only" htmlFor="listing-search">
              Search {section}
            </label>
            <input
              id="listing-search"
              name="q"
              defaultValue={query.q}
              placeholder={"Search " + section}
              type="search"
            />
            {[
              "store",
              "resources",
              "articles",
              "opportunities",
              "events",
            ].includes(section) && (
              <>
                <label className="sr-only" htmlFor="category">
                  Category
                </label>
                <input
                  id="category"
                  name="category"
                  defaultValue={query.category}
                  placeholder="Category"
                />
              </>
            )}
            {section === "store" && (
              <>
                <label className="sr-only" htmlFor="type">
                  Product type
                </label>
                <select id="type" name="type" defaultValue={query.type || ""}>
                  <option value="">All products</option>
                  <option value="course">Courses</option>
                  <option value="physical">Essentials</option>
                  <option value="digital">Digital resources</option>
                </select>
              </>
            )}
            {section === "resources" && (
              <>
                <label className="sr-only" htmlFor="level">
                  Level
                </label>
                <select
                  id="level"
                  name="level"
                  defaultValue={query.level || ""}
                >
                  <option value="">All levels</option>
                  {["100L", "200L", "300L", "400L", "500L", "Alumni"].map(
                    (x) => (
                      <option key={x}>{x}</option>
                    ),
                  )}
                </select>
                <label className="sr-only" htmlFor="type">
                  Resource type
                </label>
                <select id="type" name="type" defaultValue={query.type || ""}>
                  <option value="">All types</option>
                  {[
                    "PDF",
                    "Article",
                    "Video",
                    "Website",
                    "Template",
                    "Course",
                    "Opportunity",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </>
            )}
            <button className="btn-primary">Search</button>
            {Object.values(query).some(Boolean) && (
              <Link className="btn-ghost" href={"/" + section}>
                Clear filters
              </Link>
            )}
          </form>
          {result.docs.length ? (
            <div
              className={section === "events" ? "summit-grid" : "course-grid"}
            >
              {result.docs.map((doc: any) =>
                section === "store" ? (
                  <ProductCard key={doc.id} product={doc} />
                ) : section === "events" ? (
                  <EventCard key={doc.id} event={doc} />
                ) : (
                  <ContentCard key={doc.id} doc={doc} section={section} />
                ),
              )}
            </div>
          ) : (
            <p className="empty-state">
              {query.q || query.category || query.type || query.level
                ? "No results match your search. Try a different search or clear the filters."
                : "New " + section + " will appear here soon."}
            </p>
          )}
          <div className="pagination">
            <span>
              {result.totalDocs} {result.totalDocs === 1 ? "result" : "results"}
            </span>
            <span>
              {result.hasPrevPage && (
                <Link href={link(page - 1)}>Previous</Link>
              )}
              {result.hasNextPage && (
                <>
                  {" "}
                  <Link href={link(page + 1)}>Next</Link>
                </>
              )}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
