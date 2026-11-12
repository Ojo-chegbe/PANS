import { getPayload } from "payload";
import config from "@payload-config";
import { headers } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import { safeNext } from "./domain";
import type { RecordData } from "./domain";
export const getCMS = () => getPayload({ config });
export const getSession = cache(async () => {
  const payload = await getCMS();
  const { user } = await payload.auth({ headers: await headers() });
  return user;
});
export async function requireSession() {
  const user = await getSession();
  if (!user) {
    const path = safeNext((await headers()).get("x-pans-path") || "/account");
    redirect(`/sign-in?next=${encodeURIComponent(path)}`);
  }
  return user;
}
export async function list(
  collection: string,
  options: Record<string, unknown> = {},
) {
  const payload = await getCMS();
  return await payload.find({
    collection: collection as any,
    depth: 1,
    limit: 24,
    overrideAccess: false,
    ...options,
  } as any);
}
export async function bySlug(collection: string, slug: string, user?: any) {
  const result = await list(collection, {
    where: { slug: { equals: slug } },
    limit: 1,
    user,
  });
  return result.docs[0] as RecordData | undefined;
}
export function mediaURL(media: any, fallback = "") {
  return typeof media === "object" && media
    ? media.sizes?.card?.url || media.url || fallback
    : fallback;
}
export const settings = cache(async function settings() {
  const payload = await getCMS();
  return payload.findGlobal({ slug: "settings", overrideAccess: false });
});
export async function pageIntro(
  key: string,
  fallback: { title: string; eyebrow?: string; description?: string },
) {
  const site = await settings();
  const configured = site.pageIntros?.find((item) => item.key === key);
  return {
    ...fallback,
    ...(configured
      ? {
          title: configured.title,
          eyebrow: configured.eyebrow || fallback.eyebrow,
          description: configured.description || fallback.description,
        }
      : {}),
  };
}
