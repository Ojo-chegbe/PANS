import Link from "next/link";
import { MediaImage } from "./MediaImage";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { mediaURL } from "@/lib/payload";
import { externalURL } from "@/lib/security";
export function Body({ data }: { data: any }) {
  return data ? (
    <div className="prose">
      <RichText data={data} />
    </div>
  ) : null;
}
export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="page-intro">
      {eyebrow && <p className="section-tag">{eyebrow}</p>}
      <h1>{title}</h1>
      {description && <p className="page-lede">{description}</p>}
    </div>
  );
}
export function EventCard({ event }: { event: any }) {
  return (
    <article className="summit-card">
      {mediaURL(event.image) && (
        <Link
          href={"/events/" + event.slug}
          className="summit-thumb"
          tabIndex={-1}
          aria-hidden="true"
        >
          <MediaImage
            image={event.image}
            alt={event.image?.alt || ""}
            loading="lazy"
          />
        </Link>
      )}
      <div className="summit-body">
        <span className="summit-mode">
          {event.mode?.toUpperCase()} ·{" "}
          {event.startsAt
            ? new Date(event.startsAt).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "Africa/Lagos",
              })
            : "DATES TO BE ANNOUNCED"}
        </span>
        <h3>
          <Link href={"/events/" + event.slug}>{event.title}</Link>
        </h3>
        <p>{event.description}</p>
        <Link className="summit-join" href={"/events/" + event.slug}>
          <span>
            {event.eventStatus === "announced"
              ? "View event"
              : "View details and register"}
          </span>
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}
export function ContentCard({ doc, section }: { doc: any; section: string }) {
  return (
    <article className="course-card">
      {mediaURL(doc.image) && (
        <Link
          className="course-art has-photo"
          href={"/" + section + "/" + doc.slug}
          tabIndex={-1}
          aria-hidden="true"
        >
          <MediaImage
            image={doc.image}
            alt={doc.image?.alt || ""}
            loading="lazy"
          />
        </Link>
      )}
      <div className="course-body">
        <span className="meta">
          {doc.category || doc.position || doc.session || doc.resourceType}
        </span>
        <h4>
          <Link href={"/" + section + "/" + doc.slug}>{doc.title}</Link>
        </h4>
        <p>{doc.description}</p>
        <Link className="quiet-link" href={"/" + section + "/" + doc.slug}>
          View {section === "mentors" ? "profile" : "details"}
        </Link>
      </div>
    </article>
  );
}
export function SafeExternalLink({
  url,
  children,
}: {
  url: unknown;
  children: React.ReactNode;
}) {
  const href = externalURL(url);
  return href ? (
    <a className="btn-primary" href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  ) : null;
}
