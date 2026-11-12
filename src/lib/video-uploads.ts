import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  ListPartsCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  HeadObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  type CompletedPart,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Payload, PayloadRequest, TypedUser } from "payload";
import { sanitizeFilename } from "payload/shared";
import { DomainError } from "./domain";
import { transaction } from "./transactions";
import {
  VIDEO_MAX_BYTES,
  VIDEO_PART_BYTES,
  videoPartSize,
} from "./video-upload-shared";
import { validateMp4, VideoContainerError } from "./mp4-validation";

type Ticket = {
  version: 1;
  id: string;
  owner: string;
  uploadId: string;
  filename: string;
  size: number;
  fingerprint: string;
  expiresAt: number;
};
let storage: S3Client | undefined;
function r2() {
  if (
    !process.env.S3_BUCKET ||
    !process.env.S3_ENDPOINT ||
    !process.env.S3_ACCESS_KEY_ID ||
    !process.env.S3_SECRET_ACCESS_KEY
  )
    throw new DomainError("Video storage is not configured yet.", 503);
  return (storage ||= new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    requestHandler: { connectionTimeout: 10000, requestTimeout: 20000 },
    maxAttempts: 2,
  }));
}
const location = (ticket: Ticket) => ({
  Bucket: process.env.S3_BUCKET!,
  Key: `files/${ticket.id}/${ticket.filename}`,
});
const sign = (payload: Payload, value: string) =>
  createHmac("sha256", payload.secret)
    .update("pans-video-upload:v1:" + value)
    .digest();
export function readVideoTicket(
  payload: Payload,
  token: string,
  owner: string,
  now = Date.now(),
): Ticket {
  try {
    const [body, signature, extra] = token.split(".");
    if (!body || !signature || extra || token.length > 4096) throw new Error();
    const actual = Buffer.from(signature, "base64url"),
      expected = sign(payload, body);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      throw new Error();
    const ticket: Ticket = JSON.parse(
      Buffer.from(body, "base64url").toString(),
    );
    if (
      ticket.version !== 1 ||
      ticket.owner !== owner ||
      !/^[\da-f-]{36}$/.test(ticket.id) ||
      ticket.filename !== sanitizeFilename(ticket.filename) ||
      !/\.mp4$/i.test(ticket.filename) ||
      !Number.isSafeInteger(ticket.size) ||
      ticket.size < 32 ||
      ticket.size > VIDEO_MAX_BYTES ||
      !ticket.uploadId ||
      !Number.isSafeInteger(ticket.expiresAt)
    )
      throw new Error();
    if (ticket.expiresAt <= now)
      throw new DomainError(
        "This upload has expired. Start a new upload.",
        410,
      );
    return ticket;
  } catch (error) {
    if (error instanceof DomainError) throw error;
    throw new DomainError(
      "This upload does not belong to your account or is no longer valid.",
      403,
    );
  }
}
export async function startVideoUpload(
  payload: Payload,
  user: TypedUser,
  input: { filename: string; size: number; fingerprint: string },
) {
  const filename = sanitizeFilename(input.filename).slice(-200);
  if (
    !/\.mp4$/i.test(filename) ||
    !Number.isSafeInteger(input.size) ||
    input.size < 32 ||
    input.size > VIDEO_MAX_BYTES ||
    !/^[\da-f]{64}$/.test(input.fingerprint)
  )
    throw new DomainError("Choose an MP4 video no larger than 20 GB.", 400);
  const id = randomUUID();
  const expiresAt = Date.now() + 6 * 24 * 3600_000;
  const result = await r2().send(
    new CreateMultipartUploadCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: `files/${id}/${filename}`,
      ContentType: "video/mp4",
      Metadata: { "pans-upload": id, "pans-owner": String(user.id) },
    }),
  );
  if (!result.UploadId) throw new Error("Storage did not return an upload ID.");
  const ticket: Ticket = {
    version: 1,
    id,
    owner: String(user.id),
    uploadId: result.UploadId,
    filename,
    size: input.size,
    fingerprint: input.fingerprint,
    expiresAt,
  };
  const body = Buffer.from(JSON.stringify(ticket)).toString("base64url");
  return {
    token: body + "." + sign(payload, body).toString("base64url"),
    filename,
    size: ticket.size,
    fingerprint: ticket.fingerprint,
    partSize: VIDEO_PART_BYTES,
    expiresAt,
  };
}
async function savedFile(
  payload: Payload,
  ticket: Ticket,
  req?: PayloadRequest,
) {
  const result = await payload.find({
    collection: "files",
    where: { _objectKey: { equals: ticket.id } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  });
  const file = result.docs[0];
  return file ? { id: file.id, label: file.label } : undefined;
}
const missingUpload = (error: unknown) =>
  (error as { name?: string })?.name === "NoSuchUpload";
async function assembled(ticket: Ticket) {
  try {
    const head = await r2().send(new HeadObjectCommand(location(ticket)));
    if (
      head.ContentLength !== ticket.size ||
      head.Metadata?.["pans-upload"] !== ticket.id ||
      head.Metadata?.["pans-owner"] !== ticket.owner
    )
      throw new DomainError(
        "The uploaded file does not match this session.",
        400,
      );
    return head;
  } catch (error) {
    if (
      (error as { $metadata?: { httpStatusCode?: number } }).$metadata
        ?.httpStatusCode === 404
    )
      return undefined;
    throw error;
  }
}
export async function uploadedParts(ticket: Ticket) {
  const parts: { number: number; size: number; etag: string }[] = [];
  let marker: string | undefined;
  do {
    const page = await r2().send(
      new ListPartsCommand({
        ...location(ticket),
        UploadId: ticket.uploadId,
        PartNumberMarker: marker,
      }),
    );
    for (const part of page.Parts || []) {
      if (
        !part.PartNumber ||
        !part.ETag ||
        part.Size !== videoPartSize(ticket.size, part.PartNumber)
      )
        throw new DomainError(
          "An uploaded part has the wrong size. Discard this upload and start again.",
          400,
        );
      parts.push({ number: part.PartNumber, size: part.Size, etag: part.ETag });
    }
    marker = page.IsTruncated ? page.NextPartNumberMarker : undefined;
    if (page.IsTruncated && !marker)
      throw new Error("Storage returned an invalid part list.");
  } while (marker);
  return parts.sort((a, b) => a.number - b.number);
}
export async function videoUploadStatus(payload: Payload, ticket: Ticket) {
  const file = await savedFile(payload, ticket);
  if (file) return { file, parts: [] };
  try {
    return {
      parts: (await uploadedParts(ticket)).map(({ number, size }) => ({
        number,
        size,
      })),
    };
  } catch (error) {
    if (!missingUpload(error)) throw error;
    if (await assembled(ticket)) return { assembled: true, parts: [] };
    throw new DomainError(
      "The upload expired or was cancelled. Choose the file to start again.",
      410,
    );
  }
}
export async function signVideoParts(ticket: Ticket, numbers: number[]) {
  if (
    !numbers.length ||
    numbers.length > 8 ||
    new Set(numbers).size !== numbers.length
  )
    throw new DomainError("Invalid upload part request.", 400);
  return Promise.all(
    numbers.map(async (number) => {
      let size: number;
      try {
        size = videoPartSize(ticket.size, number);
      } catch {
        throw new DomainError("Invalid upload part.", 400);
      }
      const url = await getSignedUrl(
        r2(),
        new UploadPartCommand({
          ...location(ticket),
          UploadId: ticket.uploadId,
          PartNumber: number,
          ContentLength: size,
        }),
        { expiresIn: 900, signableHeaders: new Set(["content-length"]) },
      );
      return { number, url };
    }),
  );
}
export async function finishVideoUpload(
  payload: Payload,
  user: TypedUser,
  ticket: Ticket,
  label: string,
) {
  return transaction(payload, "video-upload:" + ticket.id, async (req) => {
    const found = await savedFile(payload, ticket, req);
    if (found) return found;
    let head = await assembled(ticket);
    if (!head) {
      const parts = await uploadedParts(ticket);
      if (
        parts.length !== Math.ceil(ticket.size / VIDEO_PART_BYTES) ||
        parts.some((part, index) => part.number !== index + 1)
      )
        throw new DomainError(
          "Some parts are still missing. Resume the upload first.",
          409,
        );
      await r2().send(
        new CompleteMultipartUploadCommand({
          ...location(ticket),
          UploadId: ticket.uploadId,
          MultipartUpload: {
            Parts: parts.map((part): CompletedPart => ({
              ETag: part.etag,
              PartNumber: part.number,
            })),
          },
        }),
      );
      head = await assembled(ticket);
    }
    if (!head) throw new Error("The completed video was not found.");
    try {
      await validateMp4(ticket.size, async (start, end) => {
        const result = await r2().send(
          new GetObjectCommand({
            ...location(ticket),
            Range: `bytes=${start}-${end}`,
            IfMatch: head!.ETag,
          }),
        );
        if (
          !result.Body ||
          result.ContentLength !== end - start + 1 ||
          !result.ContentRange
        ) {
          (result.Body as { destroy?: () => void })?.destroy?.();
          throw new Error("Storage did not return a bounded video range.");
        }
        return Buffer.from(await result.Body.transformToByteArray());
      });
    } catch (error) {
      // Keep a successfully assembled object for retry after a network failure.
      // Only a conclusive container-validation failure is discarded.
      if (error instanceof VideoContainerError) {
        await r2().send(new DeleteObjectCommand(location(ticket)));
        throw new DomainError(error.message, 422);
      }
      throw error;
    }
    req.user = user;
    req.context.verifiedVideoUpload = true;
    const file = await payload.create({
      collection: "files",
      data: {
        label:
          label.trim().slice(0, 200) || ticket.filename.replace(/\.mp4$/i, ""),
        owner: user.id,
        visibility: "private",
        filename: ticket.filename,
        mimeType: "video/mp4",
        filesize: ticket.size,
        prefix: "files",
        _objectKey: ticket.id,
      },
      overrideAccess: true,
      req,
    });
    return { id: file.id, label: file.label };
  });
}
export async function abortVideoUpload(payload: Payload, ticket: Ticket) {
  return transaction(payload, "video-upload:" + ticket.id, async (req) => {
    if (await savedFile(payload, ticket, req))
      throw new DomainError(
        "This video is already saved. Delete it from Files if you want to remove it.",
        409,
      );
    try {
      await r2().send(
        new AbortMultipartUploadCommand({
          ...location(ticket),
          UploadId: ticket.uploadId,
        }),
      );
    } catch (error) {
      if (!missingUpload(error)) throw error;
    }
    if (await assembled(ticket))
      await r2().send(new DeleteObjectCommand(location(ticket)));
  });
}
