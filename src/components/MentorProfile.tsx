import Link from "next/link";
import { Body, SafeExternalLink } from "./Content";
import { MediaImage } from "./MediaImage";
import { mediaURL } from "@/lib/media";
import type { Mentor } from "@/payload-types";
import type { CSSProperties } from "react";

export type PublicMentor = Pick<
  Mentor,
  | "id"
  | "title"
  | "slug"
  | "description"
  | "image"
  | "position"
  | "expertise"
  | "yearsExperience"
  | "availability"
  | "linkedin"
  | "content"
>;

// Keep faces in frame across the different compositions in the directory photos.
const portraitFraming: Record<string, { y: number; zoom?: number }> = {
  "ajayi-funmilola-ifeoluwa": { y: 46, zoom: 1.18 },
  "aliyu-murshideen-muhammad": { y: 31, zoom: 1.2 },
  "celestine-tsenlong-wakili": { y: 27, zoom: 1.14 },
  "ebubechukwu-francis-uzoegbo": { y: 33, zoom: 1.55 },
  "enendu-chukwuebuka-okechukwu": { y: 37, zoom: 1.95 },
  "joseph-ashivor": { y: 0 },
  "joseph-victory-chikamara": { y: 19, zoom: 1.16 },
  "martins-mercy-godwin": { y: 15 },
  "meltus-stephanie-chinasa": { y: 16 },
  "mizim-dagung-haruna": { y: 46, zoom: 1.05 },
  "nadoo-irene-tartenger": { y: 10 },
  "uketeh-sunday-nguher": { y: 16 },
  "uzoegbo-chimezu-ronald": { y: 50, zoom: 1.04 },
};

export function MentorPortrait({ mentor }: { mentor: PublicMentor }) {
  const framing = portraitFraming[mentor.slug];
  return mediaURL(mentor.image) && typeof mentor.image === "object" ? (
    <MediaImage
      className="mentor-portrait"
      image={mentor.image}
      alt={mentor.image?.alt || mentor.title}
      sizes="(max-width: 359px) 90vw, (max-width: 679px) 45vw, (max-width: 1049px) 30vw, 300px"
      style={
        framing &&
        ({
          "--mentor-portrait-y": `${framing.y}%`,
          "--mentor-portrait-zoom": framing.zoom ?? 1,
        } as CSSProperties)
      }
    />
  ) : (
    <div className="mentor-portrait mentor-initials" aria-hidden="true">
      {mentor.title
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")}
    </div>
  );
}

export function MentorFacts({ mentor }: { mentor: PublicMentor }) {
  const availability =
    mentor.availability === "available"
      ? "Available for mentorship"
      : mentor.availability === "limited"
        ? "Limited availability"
        : mentor.availability === "unavailable"
          ? "Currently unavailable"
          : "Availability to be confirmed";
  return (
    <div className="mentor-facts">
      {mentor.position && <p className="mentor-position">{mentor.position}</p>}
      <span
        className={"mentor-availability " + (mentor.availability || "unknown")}
      >
        {availability}
      </span>
      {typeof mentor.yearsExperience === "number" && (
        <p className="mentor-experience">
          {mentor.yearsExperience}{" "}
          {mentor.yearsExperience === 1 ? "year" : "years"} of experience
        </p>
      )}
      {Boolean(mentor.expertise?.length) && (
        <ul className="mentor-expertise" aria-label="Areas of expertise">
          {mentor.expertise?.map((area, index) => (
            <li key={index}>{area}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MentorActions({ mentor }: { mentor: PublicMentor }) {
  return (
    <div className="mentor-actions">
      {["available", "limited"].includes(mentor.availability || "") && (
        <Link className="btn-primary" href={"/mentorship?mentor=" + mentor.id}>
          Request mentorship
        </Link>
      )}
      <SafeExternalLink url={mentor.linkedin}>
        LinkedIn profile
      </SafeExternalLink>
    </div>
  );
}

export function MentorProfile({ mentor }: { mentor: PublicMentor }) {
  return (
    <>
      <div className="mentor-dialog-overview">
        <div className="mentor-card-photo">
          <MentorPortrait mentor={mentor} />
        </div>
        <MentorFacts mentor={mentor} />
      </div>
      {mentor.content ? (
        <Body data={mentor.content} />
      ) : (
        <p className="mentor-summary">{mentor.description}</p>
      )}
      <MentorActions mentor={mentor} />
    </>
  );
}
