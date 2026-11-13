import type { Payload } from "payload";

/** Anonymous visitors do not need to initialize the CMS to check a session. */
export async function requestSession(
  headers: Headers,
  getCMS: () => Promise<Payload>,
) {
  if (!headers.get("cookie")?.trim() && !headers.get("authorization")?.trim())
    return null;
  const payload = await getCMS();
  const { user } = await payload.auth({ headers });
  return user;
}
