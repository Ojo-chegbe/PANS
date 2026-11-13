import test, { beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import type { Payload } from "payload";
import {
  emailConfigurationError,
  emailDeliveryConfigured,
} from "../src/lib/email-config";
import { emailAdapter } from "../src/lib/email";
import {
  accessEmailMessage,
  requestAccessEmail,
} from "../src/services/account-access";
import { DomainError } from "../src/lib/domain";

const envKeys = [
  "NODE_ENV",
  "NEXT_PHASE",
  "PANS_LOCAL_PREVIEW",
  "NEXT_PUBLIC_SERVER_URL",
  "RESEND_API_KEY",
  "EMAIL_FROM_ADDRESS",
  "SMTP_HOST",
  "PAYLOAD_SECRET",
  "DATABASE_URL",
  "S3_BUCKET",
] as const;
let original: Record<string, string | undefined>;
beforeEach(() => {
  original = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  for (const key of envKeys) delete process.env[key];
  Object.assign(process.env, {
    NODE_ENV: "production",
    NEXT_PUBLIC_SERVER_URL: "https://example.test",
  });
});
afterEach(() => {
  for (const key of envKeys) {
    if (original[key] === undefined) delete process.env[key];
    else Object.assign(process.env, { [key]: original[key] });
  }
});

test("production test sender fails only when sending, before any provider call", async (t) => {
  process.env.RESEND_API_KEY = "test-key";
  const fetchMock = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("Unexpected provider call");
  });
  const errors: string[] = [];
  const adapter = await emailAdapter({
    payload: {
      logger: { error: (message: string) => errors.push(message) },
    } as unknown as Payload,
  });
  assert.equal(emailDeliveryConfigured(), false);
  await assert.rejects(
    () =>
      adapter.sendEmail({
        to: "member@example.test",
        subject: "Test",
        text: "Test",
      }),
    /Email delivery is unavailable/,
  );
  assert.equal(fetchMock.mock.callCount(), 0);
  assert.match(errors[0], /EMAIL_FROM_ADDRESS on a verified domain/);
  assert.doesNotMatch(errors.join(" "), /test-key|member@example/);
});

test("production account-link requests return 503 before touching any account", async () => {
  process.env.RESEND_API_KEY = "test-key";
  process.env.EMAIL_FROM_ADDRESS = "onboarding@RESEND.DEV";
  // No database methods: a configuration failure must not look up or mutate users.
  for (const kind of ["reset", "verification"] as const) {
    await assert.rejects(
      requestAccessEmail({} as Payload, kind, { email: "member@example.test" }),
      (error: unknown) => error instanceof DomainError && error.status === 503,
    );
    assert.match(accessEmailMessage(kind), /temporarily unavailable/);
    assert.doesNotMatch(accessEmailMessage(kind), /sent|outbox/);
  }
});

test("missing production email is unavailable; SMTP and custom Resend senders are configured", () => {
  assert.equal(emailDeliveryConfigured(), false);
  assert.match(emailConfigurationError()!, /not configured/);
  process.env.SMTP_HOST = "smtp.example.test";
  assert.equal(emailDeliveryConfigured(), true);
  process.env.RESEND_API_KEY = "test-key";
  // Resend takes priority over SMTP, so SMTP must not hide a bad Resend sender.
  assert.equal(emailDeliveryConfigured(), false);
  process.env.EMAIL_FROM_ADDRESS = "noreply@example.test";
  assert.equal(emailDeliveryConfigured(), true);
  assert.equal(emailConfigurationError(), null);
});

test("a custom production sender can deliver through Resend", async (t) => {
  process.env.RESEND_API_KEY = "test-key";
  process.env.EMAIL_FROM_ADDRESS = "noreply@example.test";
  const fetchMock = t.mock.method(globalThis, "fetch", async () =>
    Response.json({ id: "test-email-id" }),
  );
  const adapter = await emailAdapter({ payload: {} as Payload });
  assert.deepEqual(
    await adapter.sendEmail({
      to: "member@example.test",
      subject: "Test",
      text: "Test",
    }),
    { id: "test-email-id" },
  );
  assert.equal(fetchMock.mock.callCount(), 1);
  const body = JSON.parse(fetchMock.mock.calls[0].arguments[1]!.body as string);
  assert.match(body.from, /<noreply@example.test>/);
});

test("development and explicitly enabled loopback previews retain test email support", () => {
  Object.assign(process.env, {
    NODE_ENV: "development",
    RESEND_API_KEY: "test-key",
  });
  assert.equal(emailDeliveryConfigured(), true);
  Object.assign(process.env, {
    NODE_ENV: "production",
    PANS_LOCAL_PREVIEW: "1",
    NEXT_PUBLIC_SERVER_URL: "http://localhost:3000",
  });
  assert.equal(emailDeliveryConfigured(), true);
  delete process.env.RESEND_API_KEY;
  assert.equal(emailConfigurationError(), null);
  assert.match(accessEmailMessage("reset"), /local preview outbox/);
  process.env.NEXT_PUBLIC_SERVER_URL = "https://example.test";
  assert.match(emailConfigurationError()!, /not configured/);
});

test("hosted CMS config loads with the default Resend sender instead of crashing pages", async () => {
  Object.assign(process.env, {
    PAYLOAD_SECRET: "test-secret-for-config-loading-only-32-characters",
    DATABASE_URL: "postgres://unused:unused@localhost:5432/unused",
    S3_BUCKET: "test-bucket",
    RESEND_API_KEY: "test-key",
  });
  // Build the config only; do not initialize Payload or connect to external services.
  const config = await (await import("../src/payload.config")).default;
  assert.ok(
    config.collections.some((collection) => collection.slug === "users"),
  );
  assert.equal(emailDeliveryConfigured(), false);
});
