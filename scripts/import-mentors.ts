import { existsSync } from "node:fs";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { z } from "zod";
import { slugify } from "../src/lib/domain";
import { shutdown } from "./shutdown";
import type { Mentor } from "../src/payload-types";

// Raw responses (including non-consenting contacts) and originals stay in .data.
// Usage: tsx scripts/import-mentors.ts <responses.json> <photos.json> [--apply]
// The default validates the complete import and reads existing records only.
const photoSchema = z.object({
  id: z.string().regex(/^[\w-]+$/),
  portrait: z.string().min(1),
});
const responseSchema = z.object({
  "Full Name": z.string().trim().min(1),
  "Studio Photo": z.string().trim().min(1),
  "Current Role / Workplace:": z.string(),
  "Short Bio (5-10 lines)": z.string().trim().min(1),
  "Areas you can offer  Mentorship": z.string().trim().min(1),
  "One Advice for Students (Quote)": z.string().trim().min(1),
  "LinkedIn Link": z.string(),
  "WhatsApp / Email (private)": z.string(),
  "Do you agree we publish your contact info on the website?": z.enum([
    "Yes",
    "No",
  ]),
});

export function drivePhotoID(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.hostname !== "drive.google.com")
    throw new Error("Photo must reference Google Drive.");
  const id =
    url.searchParams.get("id") || url.pathname.match(/\/d\/([\w-]+)/)?.[1];
  if (!id || !/^[\w-]+$/.test(id)) throw new Error("Invalid Drive photo ID.");
  return id;
}

export function linkedinURL(value: string) {
  let link = value.trim().replace(/\s/g, "");
  if (!link || /^(nil|n\/a|none)$/i.test(link)) return null;
  if (!/^https?:\/\//i.test(link)) link = "https://" + link;
  const url = new URL(link);
  if (
    url.protocol !== "https:" ||
    !["linkedin.com", "www.linkedin.com"].includes(url.hostname) ||
    !/^\/in\/[^/]+\/?$/.test(url.pathname) ||
    url.username ||
    url.password
  )
    throw new Error("Invalid LinkedIn profile URL.");
  url.search = "";
  url.hash = "";
  return url.href;
}

function textNode(text: string) {
  return {
    type: "text",
    detail: 0,
    format: 0,
    mode: "normal",
    style: "",
    text,
    version: 1,
  };
}
function block(text: string, heading = false) {
  return {
    type: heading ? "heading" : "paragraph",
    ...(heading ? { tag: "h2" } : {}),
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: [textNode(text)],
  };
}

export function prepareMentors(raw: unknown, photos: unknown) {
  const source = z.array(z.record(z.string(), z.string())).min(1).parse(raw);
  const manifest = z.object({ files: z.array(photoSchema) }).parse(photos);
  const photoMap = new Map(manifest.files.map((photo) => [photo.id, photo]));
  if (photoMap.size !== manifest.files.length)
    throw new Error("Duplicate photo IDs.");
  const slugs = new Set<string>();
  const usedPhotos = new Set<string>();
  return source.map((entry) => {
    const row = responseSchema.parse(
      Object.fromEntries(
        Object.entries(entry).map(([key, value]) => [key.trim(), value.trim()]),
      ),
    );
    const title = row["Full Name"].replace(/\s+/g, " ");
    const slug = slugify(title);
    const photoID = drivePhotoID(row["Studio Photo"]);
    const photo = photoMap.get(photoID);
    if (!photo) throw new Error(`Missing staged photo for ${title}.`);
    if (!slug || slugs.has(slug) || usedPhotos.has(photoID))
      throw new Error(`Duplicate mentor or photo for ${title}.`);
    slugs.add(slug);
    usedPhotos.add(photoID);
    const bio = row["Short Bio (5-10 lines)"].replace(/\r\n/g, "\n");
    if (bio.includes("\uFFFD"))
      throw new Error(`Review damaged text for ${title}.`);
    const firstSentence = bio.match(/^.*?[.!?](?:\s|$)/s)?.[0].trim() || bio;
    const description =
      firstSentence.length <= 280
        ? firstSentence
        : firstSentence.slice(0, 277).replace(/\s+\S*$/, "") + "…";
    const areas = row["Areas you can offer  Mentorship"];
    const expertise = areas
      .split(/\n/.test(areas) ? /\n+/ : /[;,]/)
      .map((area) =>
        area
          .replace(/^\s*(?:\d+\.|[-•])\s*/, "")
          .trim()
          .replace(/[.;]+$/, ""),
      )
      .filter(Boolean);
    const consent =
      row["Do you agree we publish your contact info on the website?"] ===
      "Yes";
    const children = [
      block("About", true),
      ...bio.split(/\n\s*\n/).map((paragraph) => block(paragraph.trim())),
      block("Advice for students", true),
      block(row["One Advice for Students (Quote)"].replace(/^"|"$/g, "")),
    ];
    if (consent && row["WhatsApp / Email (private)"])
      children.push(
        block("Contact", true),
        block(row["WhatsApp / Email (private)"]),
      );
    const role = row["Current Role / Workplace:"];
    const data = {
      title,
      slug,
      description,
      position: /^(nil|n\/a|none)$/i.test(role) ? null : role,
      expertise,
      // These are volunteer mentor submissions. Experience and capacity were not asked.
      availability: "available" as const,
      yearsExperience: null,
      capacity: null,
      linkedin: consent ? linkedinURL(row["LinkedIn Link"]) : null,
      content: {
        root: {
          type: "root",
          format: "",
          indent: 0,
          version: 1,
          direction: "ltr",
          children,
        },
      },
      reviewStatus: "approved" as const,
      _status: "published" as const,
    };
    return { photoID, portrait: photo.portrait, consent, data };
  });
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const paths = args.filter((arg) => arg !== "--apply");
  if (paths.length !== 2 || paths.some((arg) => arg.startsWith("--")))
    throw new Error(
      "Usage: tsx scripts/import-mentors.ts <responses.json> <photos.json> [--apply]",
    );
  const plan = prepareMentors(
    JSON.parse(await readFile(paths[0], "utf8")),
    JSON.parse(await readFile(paths[1], "utf8")),
  );
  // Validate every image before any CMS write; input paths must stay in ignored staging.
  const stagingRoot = path.resolve(".data/mentor-import");
  const images = new Map<string, Buffer>();
  for (const mentor of plan) {
    const file = path.resolve(mentor.portrait);
    const relative = path.relative(stagingRoot, file);
    if (relative.startsWith("..") || path.isAbsolute(relative))
      throw new Error("Portrait must be in .data/mentor-import.");
    const bytes = await readFile(file);
    const image = await sharp(bytes).metadata();
    if (image.format !== "webp" || !image.width || !image.height)
      throw new Error(`Invalid prepared portrait for ${mentor.data.title}.`);
    images.set(mentor.photoID, bytes);
  }
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const { getPayload } = await import("payload");
  const config = (await import("../src/payload.config")).default;
  const payload = await getPayload({ config });
  // Payload's upload hooks cache file data in the request context.
  const newContext = () => ({ system: true, skipAudit: true });
  const receipt: {
    slug: string;
    mentorID: number;
    mediaID?: number;
    action: string;
  }[] = [];
  const receiptPath = path.join(stagingRoot, "import-receipt.json");
  try {
    const existing = await payload.find({
      collection: "mentors",
      limit: plan.length,
      pagination: false,
      depth: 0,
      where: { slug: { in: plan.map((mentor) => mentor.data.slug) } },
      overrideAccess: true,
    });
    const known = new Map(existing.docs.map((doc) => [doc.slug, doc]));
    console.log(
      `${apply ? "Import" : "Dry run"}: ${plan.length} mentors; ${known.size} existing; ${plan.filter((mentor) => !mentor.consent).length} without public contact consent.`,
    );
    for (const mentor of plan) {
      const previous = known.get(mentor.data.slug);
      if (previous) {
        receipt.push({
          slug: previous.slug,
          mentorID: previous.id,
          action: "preserved",
        });
        console.log(`Preserved ${previous.title}`);
        continue;
      }
      if (!apply) {
        console.log(`Would create ${mentor.data.title}`);
        continue;
      }
      const filename = `mentor-${mentor.photoID}.webp`;
      const found = await payload.find({
        collection: "media",
        where: { filename: { equals: filename } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      });
      const bytes = images.get(mentor.photoID)!;
      const image =
        found.docs[0] ||
        (await payload.create({
          collection: "media",
          data: { alt: `Portrait of ${mentor.data.title}` },
          file: {
            data: bytes,
            name: filename,
            mimetype: "image/webp",
            size: bytes.length,
          },
          overrideAccess: true,
          context: newContext(),
        }));
      const doc = await payload.create({
        collection: "mentors",
        data: {
          ...mentor.data,
          content: mentor.data.content as Mentor["content"],
          image: image.id,
        },
        overrideAccess: true,
        context: newContext(),
      });
      receipt.push({
        slug: doc.slug,
        mentorID: doc.id,
        mediaID: image.id,
        action: "created",
      });
      await mkdir(stagingRoot, { recursive: true });
      await writeFile(receiptPath, JSON.stringify(receipt, null, 2));
      console.log(`Created ${doc.title}`);
    }
    if (apply) console.log(`Finished. Receipt: ${receiptPath}`);
  } finally {
    await shutdown(payload);
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
)
  await main();
