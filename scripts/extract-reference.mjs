import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import * as cheerio from "cheerio";
const root = new URL("../", import.meta.url);
let html = await readFile(new URL("PANS_Digital_Hub_new.html", root), "utf8");
await mkdir(new URL("public/reference/", root), { recursive: true });
await mkdir(new URL("src/data/", root), { recursive: true });
await mkdir(new URL("src/app/(site)/", root), { recursive: true });
const assets = new Map();
for (const match of html.matchAll(
  /data:([\w/+.-]+);base64,([A-Za-z0-9+/=]+)/g,
)) {
  const data = Buffer.from(match[2], "base64");
  const extension = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/svg+xml": "svg",
    "image/webp": "webp",
    "font/ttf": "ttf",
    "font/woff2": "woff2",
  }[match[1]];
  if (!extension) continue;
  const name =
    createHash("sha256").update(data).digest("hex").slice(0, 16) +
    "." +
    extension;
  if (!assets.has(match[0]))
    await writeFile(new URL("public/reference/" + name, root), data);
  assets.set(match[0], "/reference/" + name);
}
for (const [original, url] of assets) html = html.replaceAll(original, url);
const $ = cheerio.load(html);
const styles = $("style")
  .map((_, node) => $(node).html())
  .get()
  .join("\n\n");
await writeFile(new URL("src/app/(site)/reference.css", root), styles);
const text = (selector) => $(selector).first().text().trim();
const image = (node) => $(node).find("img").first().attr("src") || "";
const products = $(".course-card,.detergent-card,.product-card")
  .map((i, node) => {
    const card = $(node);
    return {
      title: card.find("h3,h4").first().text().trim(),
      description: card.find("p").first().text().trim(),
      image: image(node),
      imageAlt: card.find("img").first().attr("alt") || "",
      price:
        Number(
          card
            .find(".price")
            .text()
            .replace(/[^0-9.]/g, ""),
        ) * 100,
      type: card.hasClass("course-card")
        ? "course"
        : card.hasClass("detergent-card")
          ? "physical"
          : "digital",
      order: i,
    };
  })
  .get();
const legacy = $(".archive-row")
  .map((_, node) => ({
    session: $(node).find(".tenure").text().trim(),
    name: $(node).find(".name").text().trim(),
    position: $(node).find(".role").text().trim(),
  }))
  .get();
const events = $(".summit-card")
  .map((_, node) => ({
    title: $(node).find("h3").text().trim(),
    description: $(node).find("p").text().trim(),
    image: image(node),
  }))
  .get();
const gallery = $(".marquee-item")
  .map((_, node) => ({
    caption: $(node).find(".marquee-caption").text().trim(),
    image: image(node),
    alt: $(node).find("img").attr("alt") || "",
  }))
  .get();
const milestones = $(".lab-step")
  .map((_, node) => ({
    title: $(node).find("h4").text().trim(),
    description: $(node).find("p").text().trim(),
    complete:
      $(node).find(".lab-check.done").length > 0 ||
      $(node).find(".lab-check").hasClass("checked"),
  }))
  .get();
const reference = {
  hero: {
    eyebrow: text(".hero-eyebrow"),
    title: text(".hero h1"),
    description: text(".hero .lede"),
    image: $(".hero .bg-photo").attr("src"),
    imageAlt: $(".hero .bg-photo").attr("alt"),
    caption: text(".hero-caption h3"),
    captionDescription: text(".hero-caption > p"),
  },
  products,
  legacy,
  events,
  gallery,
  milestones,
  vision: $(".vision-grid > div").first().find("p").text().trim(),
  mission: $(".vision-grid > div").last().find("p").text().trim(),
  fonts: [...assets.values()].filter((x) => x.endsWith(".ttf")),
};
await writeFile(
  new URL("src/data/reference.json", root),
  JSON.stringify(reference, null, 2) + "\n",
);
console.log(
  "Extracted",
  assets.size,
  "assets;",
  products.length,
  "products;",
  legacy.length,
  "leadership sessions;",
  gallery.length,
  "gallery photographs.",
);
