import { headers } from "next/headers";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { redirect } from "next/navigation";
import { safeNext } from "./domain";
import type { RecordData } from "./domain";
import { requestSession } from "./request-session";
import { SITE_SETTINGS_TAG } from "./site-cache";
export { mediaURL } from "./media";

// Keep database drivers, the CMS schema and the upload stack off the startup
// path for pages that can use cached public settings without accessing the CMS.
export const getCMS = cache(async () => {
  const [{ getPayload }, { default: config }] = await Promise.all([
    import("payload"),
    import("@payload-config"),
  ]);
  return getPayload({ config });
});
export const getSession = cache(async () =>
  requestSession(await headers(), getCMS),
);
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
export const bySlug = cache(
  async (collection: string, slug: string, user?: any) => {
    const result = await list(collection, {
      where: { slug: { equals: slug } },
      limit: 1,
      user,
    });
    return result.docs[0] as RecordData | undefined;
  },
);
async function readSettings() {
  const payload = await getCMS();
  return payload.findGlobal({
    slug: "settings",
    depth: 0,
    overrideAccess: false,
  });
}
// Settings contain public navigation/contact text, no user state or expiring
// media links. Admin saves invalidate this cache; CLI changes expire in a minute.
const cachedSettings = unstable_cache(readSettings, ["pans-site-settings-v1"], {
  tags: [SITE_SETTINGS_TAG],
  revalidate: 60,
});
export const settings = cache(async function settings() {
  return process.env.NODE_ENV === "production"
    ? cachedSettings()
    : readSettings();
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
