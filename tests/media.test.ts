import test from "node:test";
import assert from "node:assert/strict";
import { imageSources, mediaPath, mediaURL } from "../src/lib/media";

test("CMS image URLs stay on the current deployment instead of localhost", () => {
  const path = "/api/media/file/community%20photo.webp?prefix=media";
  for (const origin of [
    "http://localhost:3000",
    "https://old-preview.vercel.app",
  ]) {
    assert.equal(mediaPath(origin + path), path);
    assert.equal(mediaURL({ url: origin + path }), path);
  }
  assert.equal(mediaPath(path), path);
  const signed =
    "https://storage.example.test/bucket/photo.webp?X-Amz-Signature=abc";
  assert.equal(mediaPath(signed), signed);
});

test("responsive images offer thumbnails and cards without losing original dimensions", () => {
  const image = {
    url: "http://localhost:3000/api/media/file/original.webp",
    width: 1600,
    height: 1200,
    sizes: {
      thumbnail: { url: "/api/media/file/thumb.webp", width: 320, height: 240 },
      card: { url: "/api/media/file/card.webp", width: 860, height: 645 },
    },
  };
  assert.deepEqual(imageSources(image), {
    src: "/api/media/file/card.webp",
    srcSet:
      "/api/media/file/thumb.webp 320w, /api/media/file/card.webp 860w, /api/media/file/original.webp 1600w",
    width: 860,
    height: 645,
  });
  assert.equal(imageSources(image, true).src, "/api/media/file/original.webp");
  assert.equal(imageSources(image, true).width, 1600);
});

test("old uploads without generated sizes still load and missing relationships request nothing", () => {
  assert.equal(
    imageSources({ url: "/api/media/file/old.jpg" }).src,
    "/api/media/file/old.jpg",
  );
  assert.equal(
    imageSources({ url: "/api/media/file/old.jpg" }).srcSet,
    undefined,
  );
  assert.equal(imageSources(null).src, "");
  assert.equal(mediaURL(123), "");
  assert.equal(mediaURL(null, "/fallback.webp"), "/fallback.webp");
});
