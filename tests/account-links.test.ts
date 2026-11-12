import test from "node:test";
import assert from "node:assert/strict";
import {
  verificationToken,
  readVerificationToken,
} from "../src/lib/account-links";

test("verification links expire and reject tampering, raw tokens and other secrets", () => {
  const now = Date.now();
  const raw = "a".repeat(64);
  const link = verificationToken(raw, "test-secret", now);
  assert.equal(readVerificationToken(link, "test-secret", now), raw);
  assert.equal(
    readVerificationToken(link, "test-secret", now + 86_399_999),
    raw,
  );
  for (const value of [raw, "", link.replace(/^a/, "b"), link + ".extra"])
    assert.throws(() => readVerificationToken(value, "test-secret", now));
  assert.throws(() => readVerificationToken(link, "another-secret", now));
  assert.throws(
    () => readVerificationToken(link, "test-secret", now + 86_400_000),
    /expired/,
  );
});
