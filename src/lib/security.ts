import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { Payload } from "payload";
import { DomainError } from "./domain";
import { transaction } from "./transactions";
export function checkOrigin(request: Pick<Request, "headers">) {
  const origin = request.headers.get("origin");
  const expected = new URL(
    process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
  ).origin;
  if (origin !== expected)
    throw new DomainError("Please refresh the page and try again.", 403);
  const type = request.headers.get("content-type") || "";
  if (!type.startsWith("application/json"))
    throw new DomainError("Unsupported request format.", 415);
}
export async function rateLimit(
  payload: Payload,
  key: string,
  max = 15,
  minutes = 15,
) {
  const bucket = Math.floor(Date.now() / (minutes * 60_000));
  const hashed = createHash("sha256")
    .update(key + ":" + bucket)
    .digest("hex");
  await transaction(payload, "limit:" + hashed, async (req) => {
    const found = await payload.find({
      collection: "rate-limits",
      where: { key: { equals: hashed } },
      limit: 1,
      overrideAccess: true,
      req,
    });
    const doc = found.docs[0];
    if (doc && doc.count >= max)
      throw new DomainError(
        "Too many attempts. Please try again in a few minutes.",
        429,
      );
    if (doc)
      await payload.update({
        collection: "rate-limits",
        id: doc.id,
        data: { count: doc.count + 1 },
        overrideAccess: true,
        req,
      });
    else
      await payload.create({
        collection: "rate-limits",
        data: {
          key: hashed,
          count: 1,
          expiresAt: new Date((bucket + 1) * minutes * 60_000).toISOString(),
        },
        overrideAccess: true,
        req,
      });
  });
}
const equals = (a: string, b: string) =>
  /^[0-9a-f]{128}$/.test(a) &&
  /^[0-9a-f]{128}$/.test(b) &&
  timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
export function validPaystackSignature(
  raw: string,
  headers: Headers,
  now = Date.now(),
) {
  const modern = headers.get("paystack-signature");
  if (modern && process.env.PAYSTACK_WEBHOOK_SECRET) {
    const parts = modern.split(",").map((x) => x.trim());
    const timestamp = parts.find((x) => x.startsWith("t="))?.slice(2);
    if (
      !timestamp ||
      !/^\d+$/.test(timestamp) ||
      Math.abs(now / 1000 - Number(timestamp)) > 300
    )
      return false;
    const expected = createHmac("sha512", process.env.PAYSTACK_WEBHOOK_SECRET)
      .update(timestamp + "." + raw)
      .digest("hex");
    return parts
      .filter((x) => x.startsWith("v1="))
      .some((x) => {
        const value = x.slice(3);
        const signature = value.includes(":")
          ? value.slice(value.indexOf(":") + 1)
          : value;
        return equals(signature, expected);
      });
  }
  const legacy = headers.get("x-paystack-signature");
  return Boolean(
    !process.env.PAYSTACK_WEBHOOK_SECRET &&
    legacy &&
    process.env.PAYSTACK_SECRET_KEY &&
    equals(
      legacy,
      createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
        .update(raw)
        .digest("hex"),
    ),
  );
}
export function externalURL(value: unknown) {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
