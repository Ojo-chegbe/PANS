import { existsSync } from "node:fs";
import { readFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { shutdown } from "./shutdown";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const { getPayload } = await import("payload");
const config = (await import("../src/payload.config")).default;
const { slugify } = await import("../src/lib/domain");
const reference = JSON.parse(await readFile("src/data/reference.json", "utf8"));
const payload = await getPayload({ config });
const context = { system: true, skipAudit: true };
async function existing(collection: string, slug: string, data: any) {
  const found = await payload.find({
    collection: collection as any,
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  });
  if (found.docs[0]) return found.docs[0];
  return payload.create({
    collection: collection as any,
    data: { slug, ...data },
    overrideAccess: true,
    context,
  });
}
const mediaMap = new Map<string, any>();
async function media(url: string, alt: string) {
  if (!url) return undefined;
  if (mediaMap.has(url)) return mediaMap.get(url);
  const filename = path.basename(url);
  const previous = await payload.find({
    collection: "media",
    where: { filename: { contains: filename.split(".")[0] } },
    limit: 1,
    overrideAccess: true,
  });
  const doc =
    previous.docs[0] ||
    (await payload.create({
      collection: "media",
      data: { alt: alt || "PANS UNIJOS community" },
      filePath: path.resolve("public" + url),
      overrideAccess: true,
      context,
    }));
  mediaMap.set(url, doc.id);
  return doc.id;
}
const published = { reviewStatus: "approved", _status: "published" };
const heroImage = await media(
  reference.hero.image,
  reference.hero.imageAlt || "The PANS UNIJOS community",
);
for (const item of reference.products) {
  if (item.type === "digital") continue;
  const slug = slugify(item.title);
  const image = await media(item.image, item.imageAlt || item.title);
  let course: any;
  if (item.type === "course")
    course = await existing("courses", slug, {
      title: item.title,
      description: item.description,
      image,
      instructor: "PANS UNIJOS",
      delivery: "self-paced",
      isFree: false,
      ...published,
    });
  await existing("products", slug, {
    title: item.title,
    description: item.description,
    image,
    type: item.type,
    category:
      item.type === "physical"
        ? item.title.includes("Hand")
          ? "Hand Care"
          : item.title.includes("Fabric")
            ? "Laundry"
            : "Kitchen"
        : "Courses",
    price: item.price,
    stock: 0,
    course: course?.id,
    displayOrder: item.order,
    salesOpen: false,
    ...published,
  });
}
for (const record of reference.legacy) {
  const name = record.name === "Record to be added" ? "" : record.name;
  await existing("leadership", slugify(record.session), {
    title: record.session + " Leadership",
    session: record.session,
    description:
      "PANS UNIJOS leadership for the " + record.session + " session.",
    president: name,
    verified: false,
    executives: name ? [{ name, position: "President" }] : [],
    ...published,
  });
}
for (const event of reference.events)
  await existing("events", slugify(event.title), {
    title: event.title,
    description: event.description,
    image: await media(event.image, event.title),
    mode: "hybrid",
    category: "Summit",
    eventStatus: "announced",
    ...published,
  });
const album = await existing("albums", "community-moments", {
  title: "PANS community moments",
  description:
    "Health outreaches, facility tours, cultural day, and community activities.",
  ...published,
});
for (const [position, photo] of reference.gallery.entries()) {
  const found = await payload.find({
    collection: "photos",
    where: {
      and: [
        { album: { equals: album.id } },
        { position: { equals: position } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  });
  if (!found.docs[0])
    await payload.create({
      collection: "photos",
      data: {
        album: album.id,
        image: await media(photo.image, photo.alt || photo.caption),
        caption: photo.caption,
        position,
      },
      overrideAccess: true,
      context,
    });
}
await existing("projects", "computer-lab-upgrade", {
  title: "Computer lab upgrade",
  description: "The PANS UNIJOS computer lab upgrade project.",
  milestones: reference.milestones.map((item: any, index: number) => ({
    ...item,
    complete: index === 0,
  })),
  ...published,
});
const home = await payload.findGlobal({ slug: "home", overrideAccess: true });
if (!home.hero?.title)
  await payload.updateGlobal({
    slug: "home",
    data: {
      hero: {
        eyebrow: reference.hero.eyebrow,
        title: "Together, we build\na better future.",
        description: reference.hero.description,
        image: heroImage,
        caption: reference.hero.caption,
        captionDescription: reference.hero.captionDescription,
        primaryLabel: "Explore the store",
        primaryURL: "/store",
        secondaryLabel: "Find a mentor",
        secondaryURL: "/mentorship",
      },
      stats: [
        { value: "4", label: "Summits / year" },
        { value: "3", label: "Mentorship tiers" },
        { value: "2", label: "Mock exam cycles" },
      ],
      pathways: [
        {
          title: "Learn something new",
          description: "Courses & student essentials",
          url: "/store",
        },
        {
          title: "Find your direction",
          description: "Guidance for your next step",
          url: "/mentorship",
        },
        {
          title: "Grow your circle",
          description: "Ideas, events & connections",
          url: "/events",
        },
      ],
      sections: [
        {
          kind: "store",
          visible: true,
          eyebrow: "The Digital Hub",
          title: "A little investment.\nA world of possibility.",
          description:
            "Digital products that fund association work — every sale supports PANS UNIJOS.",
        },
        {
          kind: "archive",
          visible: true,
          eyebrow: "Institutional Memory",
          title: "Legacy Archive",
          description:
            "A living record of PANS UNIJOS leadership — search by name or session.",
        },
        {
          kind: "mentorship",
          visible: true,
          eyebrow: "Guidance, Structured",
          title: "Your next step, with support.",
          description:
            "Find guidance for your journey, and follow the spaces we’re building for it.",
        },
        {
          kind: "events",
          visible: true,
          eyebrow: "Capacity Building",
          title: "Big ideas. Real connections.",
          description:
            "At least two per semester — hybrid, so cost is never the reason someone misses out.",
        },
        {
          kind: "about",
          visible: true,
          eyebrow: "Why This Exists",
          title: "Vision & Mission",
        },
        {
          kind: "gallery",
          visible: true,
          eyebrow: "Real Moments",
          title: "This is what belonging looks like.",
          description:
            "Health outreaches, facility tours, cultural day, community clean-ups — the association, in action.",
        },
      ],
      storePromos: reference.products
        .filter((x: any) => x.type === "digital")
        .map((item: any) => ({
          title: item.title,
          description: item.description,
          priceLabel:
            "From " +
            new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
              maximumFractionDigits: 0,
            }).format(item.price / 100),
          url: "/store?category=" + encodeURIComponent(item.title),
        })),
      vision: reference.vision,
      mission: reference.mission,
      _status: "published",
    },
    overrideAccess: true,
    context,
  });
const settings = await payload.findGlobal({
  slug: "settings",
  overrideAccess: true,
});
if (!settings.navigation?.length)
  await payload.updateGlobal({
    slug: "settings",
    data: {
      siteName: "PANS Digital Hub",
      description:
        "Your PANS UNIJOS community. Build skills, find guidance, explore our legacy, and grow together.",
      navigation: [
        { label: "Explore the store", url: "/store" },
        { label: "Mentorship", url: "/mentorship" },
        { label: "Events", url: "/events" },
        { label: "Our legacy", url: "/legacy" },
        { label: "Community", url: "/community" },
      ],
      footerDescription:
        "Built for the journey ahead. A connected, self-sustaining community for every PANSite at the University of Jos.",
      footerGroups: [
        {
          title: "Explore",
          links: [
            { label: "Store", url: "/store" },
            { label: "Resources", url: "/resources" },
            { label: "Mentorship", url: "/mentorship" },
            { label: "Events", url: "/events" },
            { label: "Legacy Archive", url: "/legacy" },
          ],
        },
        {
          title: "Association",
          links: [
            { label: "About PANS", url: "/about" },
            { label: "News & articles", url: "/articles" },
            { label: "Opportunities", url: "/opportunities" },
            { label: "Contribute", url: "/contribute" },
            { label: "Contact", url: "/contact" },
          ],
        },
      ],
      copyright:
        "Pharmaceutical Association of Nigerian Students — University of Jos Chapter",
    },
    overrideAccess: true,
    context,
  });
function richText(text: string) {
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children: text.split("\n\n").map((paragraph) => ({
        type: "paragraph",
        format: "",
        indent: 0,
        version: 1,
        direction: "ltr",
        children: [
          {
            type: "text",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: paragraph,
            version: 1,
          },
        ],
      })),
    },
  };
}
await existing("pages", "about", {
  title: "More than an association.",
  description:
    "Pharmaceutical Association of Nigerian Students, University of Jos Chapter.",
  content: richText(
    "Vision\n" + reference.vision + "\n\nMission\n" + reference.mission,
  ),
  ...published,
});
for (const [slug, title] of [
  ["privacy", "Privacy information"],
  ["terms", "Terms of use"],
  ["refunds", "Refund information"],
])
  await existing("pages", slug, {
    title,
    description:
      "This information is being prepared by PANS UNIJOS. Please contact the PANS team with any questions before making a purchase.",
    reviewStatus: "approved",
    _status: "published",
  });
for (const [index, font] of reference.fonts.entries())
  await copyFile(
    path.resolve("public" + font),
    path.resolve(
      "public/reference/" +
        (index === 0 ? "aeonik-regular.ttf" : "aeonik-bold.ttf"),
    ),
  );
console.log(
  "Imported the supplied mock. Existing records were preserved. No accounts, stock, course lessons, or paid files were invented.",
);
await shutdown(payload);
