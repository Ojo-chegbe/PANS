import { revalidateTag } from "next/cache";

export const SITE_SETTINGS_TAG = "pans-site-settings";

export function invalidateSiteSettings() {
  // CLI seeds and integration tests do not have a Next.js cache context.
  // The time limit on the cached read also covers changes made by those tools.
  if (process.env.NEXT_RUNTIME) revalidateTag(SITE_SETTINGS_TAG, { expire: 0 });
}
