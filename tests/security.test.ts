import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { validPaystackSignature, checkOrigin } from "../src/lib/security";
test("modern payment signatures require an authentic, recent, unchanged raw body", () => {
  process.env.PAYSTACK_WEBHOOK_SECRET = "whsec_test";
  const now = Date.now();
  const t = String(Math.floor(now / 1000));
  const body = '{"event":"charge.success","amount":1.50}';
  const signature = createHmac("sha512", "whsec_test")
    .update(t + "." + body)
    .digest("hex");
  const headers = new Headers({
    "Paystack-Signature": "t=" + t + ",v1=whk_test:" + signature,
  });
  assert.equal(validPaystackSignature(body, headers, now), true);
  assert.equal(validPaystackSignature(body + " ", headers, now), false);
  assert.equal(validPaystackSignature(body, headers, now + 301000), false);
  assert.equal(validPaystackSignature(body, new Headers(), now), false);
  delete process.env.PAYSTACK_WEBHOOK_SECRET;
});
test("legacy signatures remain supported only when no modern signing secret is configured", () => {
  process.env.PAYSTACK_SECRET_KEY = "sk_test";
  const raw = '{"event":"charge.success"}';
  const signature = createHmac("sha512", "sk_test").update(raw).digest("hex");
  assert.equal(
    validPaystackSignature(
      raw,
      new Headers({ "x-paystack-signature": signature }),
    ),
    true,
  );
  assert.equal(
    validPaystackSignature(
      raw,
      new Headers({ "x-paystack-signature": "a".repeat(128) }),
    ),
    false,
  );
  assert.equal(
    validPaystackSignature(
      raw,
      new Headers({ "x-paystack-signature": "é".repeat(128) }),
    ),
    false,
  );
  process.env.PAYSTACK_WEBHOOK_SECRET = "whsec_test";
  assert.equal(
    validPaystackSignature(
      raw,
      new Headers({ "x-paystack-signature": signature }),
    ),
    false,
  );
  delete process.env.PAYSTACK_WEBHOOK_SECRET;
  delete process.env.PAYSTACK_SECRET_KEY;
});
test("mutations reject missing or foreign origins and unsupported content types", () => {
  process.env.NEXT_PUBLIC_SERVER_URL = "http://localhost:3000";
  assert.doesNotThrow(() =>
    checkOrigin(
      new Request("http://localhost:3000/api/hub/profile", {
        method: "POST",
        headers: {
          Origin: "http://localhost:3000",
          "Content-Type": "application/json",
        },
      }),
    ),
  );
  for (const origin of ["https://other.test", "null", ""])
    assert.throws(() =>
      checkOrigin(
        new Request("http://localhost:3000/api/hub/profile", {
          method: "POST",
          headers: { Origin: origin, "Content-Type": "application/json" },
        }),
      ),
    );
  assert.throws(() =>
    checkOrigin(
      new Request("http://localhost:3000/api/hub/profile", {
        method: "POST",
        headers: {
          Origin: "http://localhost:3000",
          "Content-Type": "text/plain",
        },
      }),
    ),
  );
});
