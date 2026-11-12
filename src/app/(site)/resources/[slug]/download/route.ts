import { NextResponse } from "next/server";
import { getCMS } from "@/lib/payload";
import { relationID } from "@/lib/domain";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const payload = await getCMS();
  const { user } = await payload.auth({ headers: request.headers });
  const { slug } = await params;
  if (!user)
    return NextResponse.redirect(
      new URL(
        "/sign-in?next=" +
          encodeURIComponent("/resources/" + slug + "/download"),
        request.url,
      ),
    );
  const found = await payload.find({
    collection: "resources",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: false,
    user,
  });
  const resource = found.docs[0];
  if (!resource?.file)
    return new Response("This resource is not available.", { status: 404 });
  const file = await payload
    .findByID({
      collection: "files",
      id: relationID(resource.file)!,
      overrideAccess: false,
      user,
    })
    .catch(() => null);
  if (!file?.url)
    return new Response("This file is not available for download.", {
      status: 403,
    });
  await payload.create({
    collection: "downloads",
    data: { owner: user.id, resource: resource.id, file: file.id },
    overrideAccess: true,
  });
  const response = NextResponse.redirect(new URL(file.url, request.url));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
