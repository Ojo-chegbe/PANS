import path from "node:path";
import { randomUUID } from "node:crypto";
import { getCMS } from "@/lib/payload";
import { rateLimit } from "@/lib/security";
import { assert, DomainError, isStaff, type Actor } from "@/lib/domain";
export async function POST(request: Request) {
  try {
    assert(
      request.headers.get("origin") ===
        new URL(process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000")
          .origin,
      "Please refresh and try again.",
      403,
    );
    const payload = await getCMS();
    const { user } = await payload.auth({ headers: request.headers });
    assert(
      user &&
        (isStaff(user as Actor) ||
          (user as Actor).roles?.includes("contributor")),
      "Contributor access is required.",
      403,
    );
    await rateLimit(payload, "upload:" + user.id, 20, 60);
    const form = await request.formData();
    const file = form.get("file");
    assert(
      file instanceof File && file.size > 0 && file.size <= 50 * 1024 * 1024,
      "Choose a PDF or ZIP file smaller than 50 MB.",
    );
    const data = Buffer.from(await file.arrayBuffer());
    const pdf = data.subarray(0, 5).toString() === "%PDF-";
    const zip = data[0] === 0x50 && data[1] === 0x4b;
    assert(
      pdf || zip,
      "Only PDF and ZIP files are accepted for contributor submissions.",
    );
    const extension = pdf ? ".pdf" : ".zip";
    const uploaded = await payload.create({
      collection: "files",
      data: {
        label: path.basename(file.name).slice(0, 200),
        visibility: "private",
      },
      file: {
        data,
        mimetype: pdf ? "application/pdf" : "application/zip",
        name: randomUUID() + extension,
        size: data.length,
      },
      overrideAccess: false,
      user,
    });
    return Response.json({ id: uploaded.id, label: uploaded.label });
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof DomainError
            ? error.message
            : "The file could not be uploaded.",
      },
      { status: error instanceof DomainError ? error.status : 500 },
    );
  }
}
