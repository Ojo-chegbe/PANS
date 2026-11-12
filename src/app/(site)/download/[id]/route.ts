import { NextResponse } from "next/server";
import { getCMS } from "@/lib/payload";
import { isStaff, relationID, type Actor } from "@/lib/domain";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const payload = await getCMS();
  const { user } = await payload.auth({ headers: request.headers });
  const { id } = await params;
  if (!user)
    return NextResponse.redirect(
      new URL(
        "/sign-in?next=" + encodeURIComponent("/download/" + id),
        request.url,
      ),
    );
  const product = await payload
    .findByID({ collection: "products", id, depth: 0, overrideAccess: true })
    .catch(() => null);
  if (!product?.file)
    return new Response("This download is not available.", { status: 404 });
  const grant = await payload.count({
    collection: "entitlements",
    where: {
      and: [
        { owner: { equals: user.id } },
        { product: { equals: product.id } },
        { active: { equals: true } },
      ],
    },
    overrideAccess: true,
  });
  if (!isStaff(user as Actor) && !grant.totalDocs)
    return new Response("Purchase this product to access the download.", {
      status: 403,
    });
  const file = await payload.findByID({
    collection: "files",
    id: relationID(product.file)!,
    overrideAccess: false,
    user,
  });
  if (!file.url)
    return new Response("This file is unavailable.", { status: 404 });
  await payload.create({
    collection: "downloads",
    data: { owner: user.id, product: product.id, file: file.id },
    overrideAccess: true,
  });
  const response = NextResponse.redirect(new URL(file.url, request.url));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
