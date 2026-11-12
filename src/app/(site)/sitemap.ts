import type { MetadataRoute } from "next";
export const dynamic = "force-dynamic";
import { getCMS } from "@/lib/payload";
import { sections } from "@/lib/sections";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
  const payload = await getCMS();
  const entries = await Promise.all(
    Object.entries(sections).map(async ([section, config]) => {
      const docs = await payload.find({
        collection: config.collection as any,
        limit: 10000,
        depth: 0,
        overrideAccess: false,
        select: { slug: true, updatedAt: true, seo: true },
      });
      return [
        { url: base + "/" + section },
        ...docs.docs
          .filter((doc: any) => !doc.seo?.noIndex)
          .map((doc: any) => ({
            url: base + "/" + section + "/" + doc.slug,
            lastModified: doc.updatedAt,
          })),
      ];
    }),
  );
  const pages = await payload.find({
    collection: "pages",
    limit: 1000,
    depth: 0,
    overrideAccess: false,
  });
  return [
    { url: base },
    ...entries.flat(),
    ...pages.docs
      .filter((doc) => !doc.seo?.noIndex)
      .map((doc) => ({
        url: base + "/" + doc.slug,
        lastModified: doc.updatedAt,
      })),
  ];
}
