import Link from "next/link";
import type { Where } from "payload";
import { list } from "@/lib/payload";
import { PageIntro } from "./Content";
import { MentorDialog } from "./MentorDialog";
import {
  MentorPortrait,
  MentorProfile,
  type PublicMentor,
} from "./MentorProfile";

export async function MentorDirectory({
  query,
  intro,
}: {
  query: Record<string, string | undefined>;
  intro: { title: string; eyebrow?: string; description?: string };
}) {
  const search =
    typeof query.q === "string" ? query.q.slice(0, 150).trim() : "";
  const availability = ["available", "limited"].includes(
    query.availability || "",
  )
    ? query.availability!
    : "";
  const pageNumber = Number(query.page);
  const page = Number.isFinite(pageNumber)
    ? Math.max(1, Math.min(Math.floor(pageNumber), 10000))
    : 1;
  const filters: Where[] = [
    {
      availability: {
        in: availability ? [availability] : ["available", "limited"],
      },
    },
  ];
  if (search)
    filters.push({
      or: ["title", "description", "position", "expertise"].map((field) => ({
        [field]: { like: search },
      })),
    });
  const result = await list("mentors", {
    where: { and: filters },
    sort: "title",
    page,
    limit: 24,
    // Keep account relationships and internal review notes off the directory.
    select: {
      title: true,
      slug: true,
      description: true,
      image: true,
      position: true,
      expertise: true,
      yearsExperience: true,
      availability: true,
      linkedin: true,
      content: true,
    },
  });
  const mentors = result.docs as PublicMentor[];
  const pageLink = (target: number) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (availability) params.set("availability", availability);
    params.set("page", String(target));
    return "/mentors?" + params.toString();
  };
  return (
    <div className="wrap page-shell">
      <PageIntro {...intro} />
      <form className="mentor-controls" role="search" action="/mentors">
        <div className="mentor-search-field">
          <label htmlFor="mentor-search">Find a mentor</label>
          <input
            id="mentor-search"
            name="q"
            type="search"
            defaultValue={search}
            placeholder="Name, role, or area of expertise"
          />
        </div>
        <div className="mentor-availability-field">
          <label htmlFor="mentor-availability">Availability</label>
          <select
            id="mentor-availability"
            name="availability"
            defaultValue={availability}
          >
            <option value="">All available</option>
            <option value="available">Available</option>
            <option value="limited">Limited</option>
          </select>
        </div>
        <button className="btn-primary" type="submit">
          Find mentors
        </button>
        {(search || availability) && (
          <Link className="btn-ghost" href="/mentors">
            Clear filters
          </Link>
        )}
      </form>
      <p className="mentor-results">
        {result.totalDocs} {result.totalDocs === 1 ? "mentor" : "mentors"}
      </p>
      {mentors.length ? (
        <div className="mentor-grid">
          {mentors.map((mentor) => (
            <article className="mentor-card" key={mentor.id}>
              <div className="mentor-card-photo">
                <MentorPortrait mentor={mentor} />
                {mentor.availability === "limited" && (
                  <span className="mentor-availability limited">
                    Limited availability
                  </span>
                )}
              </div>
              <div className="mentor-card-body">
                <h2>{mentor.title}</h2>
                <p className="mentor-card-role">
                  {mentor.position || mentor.expertise?.[0] || "Mentor"}
                </p>
                <MentorDialog
                  name={mentor.title}
                  href={"/mentors/" + mentor.slug}
                >
                  <MentorProfile mentor={mentor} />
                </MentorDialog>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>
            {search || availability
              ? "No mentors match your search."
              : "Meet your mentors soon."}
          </h2>
          <p>
            {search || availability
              ? "Try another name or area of expertise, or clear your filters."
              : "Mentor profiles will appear here as they become available. You can still request guidance from the PANS team."}
          </p>
          <Link
            className="btn-ghost"
            href={search || availability ? "/mentors" : "/mentorship"}
          >
            {search || availability
              ? "View all available mentors"
              : "Request a mentor"}
          </Link>
        </div>
      )}
      {(result.hasPrevPage || result.hasNextPage) && (
        <nav
          className="pagination mentor-pagination"
          aria-label="Mentor directory pages"
        >
          {result.hasPrevPage && (
            <Link href={pageLink(page - 1)}>Previous</Link>
          )}
          <span>
            Page {page} of {result.totalPages}
          </span>
          {result.hasNextPage && <Link href={pageLink(page + 1)}>Next</Link>}
        </nav>
      )}
      <div className="mentor-directory-footer">
        <p>Share your experience with the next generation of pharmacists.</p>
        <Link className="quiet-link" href="/contribute?kind=mentor">
          Become a mentor
        </Link>
      </div>
    </div>
  );
}
