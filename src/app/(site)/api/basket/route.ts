import { getCMS } from "@/lib/payload";
import { checkOrigin, rateLimit } from "@/lib/security";
import { transaction } from "@/lib/transactions";
import { assert, DomainError, relationID } from "@/lib/domain";
import { z } from "zod";
async function lines(payload: any, items: any[]) {
  const ids = items.map((x) => relationID(x.product)).filter(Boolean);
  if (!ids.length) return [];
  const products = await payload.find({
    collection: "products",
    where: { id: { in: ids } },
    limit: 40,
    depth: 0,
    overrideAccess: false,
  });
  return items.flatMap((item) => {
    const product = products.docs.find(
      (p: any) => String(p.id) === String(relationID(item.product)),
    );
    return product
      ? [
          {
            product: product.id,
            title: product.title,
            price: product.price,
            type: product.type,
            quantity:
              product.type === "physical" ? Math.min(20, item.quantity) : 1,
          },
        ]
      : [];
  });
}
export async function GET(request: Request) {
  const payload = await getCMS();
  const { user } = await payload.auth({ headers: request.headers });
  if (!user)
    return Response.json(
      { owner: null, items: [] },
      { status: 401, headers: { "Cache-Control": "private, no-store" } },
    );
  const cart = await payload.find({
    collection: "carts",
    where: { owner: { equals: user.id } },
    limit: 1,
    depth: 0,
    overrideAccess: false,
    user,
  });
  return Response.json(
    { owner: user.id, items: await lines(payload, cart.docs[0]?.items || []) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const payload = await getCMS();
    const { user } = await payload.auth({ headers: request.headers });
    assert(user, "Please sign in.", 401);
    await rateLimit(payload, "basket:" + user.id, 300, 15);
    const data = z
      .object({
        owner: z.number().int().positive(),
        mode: z.enum(["replace", "merge"]).default("replace"),
        items: z
          .array(
            z.object({
              product: z.union([z.string(), z.number()]),
              quantity: z.number().int().min(1).max(20),
            }),
          )
          .max(40),
      })
      .parse(await request.json());
    assert(
      data.owner === user.id,
      "Your session has changed. Refresh the page before updating your basket.",
      403,
    );
    assert(
      new Set(data.items.map((x) => String(x.product))).size ===
        data.items.length,
      "The basket contains duplicate items.",
    );
    let items = await lines(payload, data.items);
    await transaction(payload, "basket:" + user.id, async (req) => {
      const key = String(user.id);
      const existing = await payload.find({
        collection: "carts",
        where: { key: { equals: key } },
        limit: 1,
        overrideAccess: true,
        req,
      });
      if (data.mode === "merge") {
        const merged = new Map<number, { product: number; quantity: number }>();
        for (const line of [
          ...(existing.docs[0]?.items || []),
          ...data.items,
        ]) {
          const id = relationID(line.product);
          if (!id) continue;
          merged.set(id, {
            product: id,
            quantity: Math.min(
              20,
              Math.max(merged.get(id)?.quantity || 0, line.quantity),
            ),
          });
        }
        items = await lines(payload, [...merged.values()].slice(0, 40));
      }
      const value = {
        owner: user.id,
        items: items.map((x: any) => ({
          product: x.product,
          quantity: x.quantity,
        })),
      };
      if (existing.docs[0])
        await payload.update({
          collection: "carts",
          id: existing.docs[0].id,
          data: value,
          overrideAccess: true,
          req,
        });
      else
        await payload.create({
          collection: "carts",
          data: { key, ...value },
          overrideAccess: true,
          req,
        });
    });
    return Response.json(
      { owner: user.id, items },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof DomainError
            ? error.message
            : "Your basket could not be synced.",
      },
      {
        status: error instanceof DomainError ? error.status : 400,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }
}
