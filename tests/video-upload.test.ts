import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import type { Payload } from "payload";
import { validateMp4, VideoContainerError } from "../src/lib/mp4-validation";
import {
  VIDEO_MAX_BYTES,
  VIDEO_PART_BYTES,
  videoPartSize,
} from "../src/lib/video-upload-shared";
import { readVideoTicket } from "../src/lib/video-uploads";

const box = (type: string, body: Buffer) => {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(8 + body.length);
  head.write(type, 4);
  return Buffer.concat([head, body]);
};
const ftyp = box("ftyp", Buffer.from("isom\0\0\0\0isommp42", "binary"));
const handler = (type: string) =>
  box(
    "hdlr",
    Buffer.concat([Buffer.alloc(8), Buffer.from(type), Buffer.alloc(12)]),
  );
const moov = (type = "vide") =>
  box("moov", box("trak", box("mdia", handler(type))));

test("an 8 GiB MP4 validates using bounded metadata reads, skipping media payload", async () => {
  const mediaLength = 8 * 1024 ** 3;
  const mdat = Buffer.alloc(16);
  mdat.writeUInt32BE(1);
  mdat.write("mdat", 4);
  mdat.writeBigUInt64BE(BigInt(mediaLength), 8);
  const tail = moov();
  const tailOffset = ftyp.length + mediaLength;
  const total = tailOffset + tail.length;
  let readBytes = 0;
  const result = await validateMp4(total, async (start, end) => {
    readBytes += end - start + 1;
    if (start < ftyp.length) return ftyp.subarray(start, end + 1);
    if (start === ftyp.length) return mdat.subarray(0, end - start + 1);
    assert.ok(start >= tailOffset, "Validator tried to read video payload.");
    return tail.subarray(start - tailOffset, end + 1 - tailOffset);
  });
  assert.equal(result.bytes, readBytes);
  assert.ok(readBytes < 512);
});
test("audio-only, truncated and forged-size containers are rejected", async () => {
  for (const body of [
    Buffer.from("not an MP4 video"),
    Buffer.concat([ftyp, moov("soun"), box("mdat", Buffer.alloc(8))]),
    Buffer.concat([ftyp, Buffer.from([255, 255, 255, 255, 109, 100, 97, 116])]),
  ])
    await assert.rejects(
      validateMp4(body.length, async (start, end) =>
        body.subarray(start, end + 1),
      ),
      VideoContainerError,
    );
});
test("part lengths cover the full upload and reject oversized or invented parts", () => {
  assert.equal(videoPartSize(VIDEO_PART_BYTES + 23, 1), VIDEO_PART_BYTES);
  assert.equal(videoPartSize(VIDEO_PART_BYTES + 23, 2), 23);
  assert.throws(() => videoPartSize(VIDEO_MAX_BYTES + 1, 1));
  assert.throws(() => videoPartSize(100, 2));
  assert.throws(() => videoPartSize(100, 0));
});
test("upload references reject tampering, another user, and expiry", () => {
  const payload = { secret: "isolated-video-test-secret" } as Payload;
  const ticket = {
    version: 1,
    id: "babc50db-3bd1-4f4d-aa28-6c4de5d3f342",
    owner: "17",
    uploadId: "upload-test",
    filename: "lesson.mp4",
    size: 1024,
    fingerprint: "a".repeat(64),
    expiresAt: 2000,
  };
  const body = Buffer.from(JSON.stringify(ticket)).toString("base64url");
  const signature = createHmac("sha256", payload.secret)
    .update("pans-video-upload:v1:" + body)
    .digest("base64url");
  const token = body + "." + signature;
  assert.equal(readVideoTicket(payload, token, "17", 1000).id, ticket.id);
  assert.throws(() => readVideoTicket(payload, token, "18", 1000));
  assert.throws(() =>
    readVideoTicket(payload, body + "." + "a".repeat(43), "17", 1000),
  );
  assert.throws(() => readVideoTicket(payload, token, "17", 2001));
});
