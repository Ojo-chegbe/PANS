import { z } from "zod";
import { getCMS } from "@/lib/payload";
import { checkOrigin, rateLimit } from "@/lib/security";
import { DomainError, isStaff, type Actor } from "@/lib/domain";
import {
  abortVideoUpload,
  finishVideoUpload,
  readVideoTicket,
  signVideoParts,
  startVideoUpload,
  videoUploadStatus,
} from "@/lib/video-uploads";
export const runtime = "nodejs";
export const maxDuration = 60;
const inputSchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("start"),
      filename: z.string().min(1).max(240),
      size: z.number().int().positive(),
      fingerprint: z.string().regex(/^[a-f\d]{64}$/),
    })
    .strict(),
  z
    .object({ action: z.literal("status"), token: z.string().max(4096) })
    .strict(),
  z
    .object({
      action: z.literal("parts"),
      token: z.string().max(4096),
      numbers: z.array(z.number().int().positive()).min(1).max(8),
    })
    .strict(),
  z
    .object({
      action: z.literal("complete"),
      token: z.string().max(4096),
      label: z.string().max(200),
    })
    .strict(),
  z
    .object({ action: z.literal("abort"), token: z.string().max(4096) })
    .strict(),
]);
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    if (Number(request.headers.get("content-length")) > 16384)
      throw new DomainError("Request is too large.", 413);
    const payload = await getCMS();
    const { user } = await payload.auth({ headers: request.headers });
    if (
      !user ||
      !(
        isStaff(user as Actor) || (user as Actor).roles?.includes("contributor")
      )
    )
      throw new DomainError("Contributor or staff access is required.", 403);
    const raw = await request.text();
    if (raw.length > 16384) throw new DomainError("Request is too large.", 413);
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new DomainError("Invalid request.", 400);
    }
    const result = inputSchema.safeParse(parsed);
    if (!result.success) throw new DomainError("Invalid upload request.", 400);
    const input = result.data;
    let output: unknown;
    if (input.action === "start") {
      await rateLimit(payload, "video-upload-start:" + user.id, 10, 60);
      output = await startVideoUpload(payload, user, input);
    } else {
      const ticket = readVideoTicket(payload, input.token, String(user.id));
      switch (input.action) {
        case "status":
          output = await videoUploadStatus(payload, ticket);
          break;
        case "parts":
          output = { parts: await signVideoParts(ticket, input.numbers) };
          break;
        case "complete":
          output = {
            file: await finishVideoUpload(payload, user, ticket, input.label),
          };
          break;
        case "abort":
          await abortVideoUpload(payload, ticket);
          output = { cancelled: true };
          break;
      }
    }
    return Response.json(output, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    if ((error as { name?: string })?.name === "NoSuchUpload")
      return Response.json(
        {
          message: "This upload expired or was cancelled. Start a new upload.",
        },
        { status: 410, headers: { "Cache-Control": "private, no-store" } },
      );
    return Response.json(
      {
        message:
          error instanceof DomainError
            ? error.message
            : "The upload could not be completed. Your uploaded parts are saved; please retry.",
      },
      {
        status: error instanceof DomainError ? error.status : 503,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }
}
