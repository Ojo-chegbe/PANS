import Link from "next/link";
import { list } from "@/lib/payload";
import { sections } from "@/lib/sections";
import { PageIntro } from "@/components/Content";
export const metadata = {
  title: "Search the Hub",
  robots: { index: false, follow: true },
};
export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = await searchParams;
  const q = query.q?.trim().slice(0, 150) || "";
  const groups = q
    ? await Promise.all(
        Object.entries(sections).map(async ([section, config]) => {
          const result = await list(config.collection, {
            where: {
              or: [{ title: { like: q } }, { description: { like: q } }],
            },
            limit: 10,
            depth: 0,
            select: { title: true, slug: true, description: true },
          });
          return { section, docs: result.docs };
        }),
      )
    : [];
  return (
    <div className="wrap page-shell">
      <PageIntro eyebrow="Find your next step" title="Search the Hub." />
      <form className="list-controls" role="search">
        <label className="sr-only" htmlFor="search-query">
          Search terms
        </label>
        <input
          id="search-query"
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Courses, resources, events, mentors…"
          required
        />
        <button className="btn-primary">Search</button>
      </form>
      {q && <p className="form-note">Results for “{q}”</p>}
      <div className="search-results">
        {groups.flatMap((group) =>
          group.docs.map((doc: any) => (
            <Link
              className="search-result"
              href={"/" + group.section + "/" + doc.slug}
              key={group.section + doc.id}
            >
              <span className="meta">{group.section}</span>
              <h2>{doc.title}</h2>
              <p>{doc.description}</p>
            </Link>
          )),
        )}
      </div>
      {q && !groups.some((group) => group.docs.length) && (
        <p className="empty-state">
          No results yet. Try a different name, topic, or keyword.
        </p>
      )}
    </div>
  );
}
