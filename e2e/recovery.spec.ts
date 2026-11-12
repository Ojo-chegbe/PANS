import { test, expect, type Page } from "@playwright/test";
import { readFile, readdir } from "node:fs/promises";

const origin = "http://localhost:3000";
async function latestToken(
  email: string,
  kind: "verify-email" | "reset-password",
) {
  const files = (await readdir(".data/mail")).sort().reverse();
  for (const file of files.slice(0, 100)) {
    const mail = JSON.parse(await readFile(".data/mail/" + file, "utf8"));
    if (!JSON.stringify(mail.to).includes(email)) continue;
    const match = String(mail.html).match(
      new RegExp(`${kind}\\?token=([^"<\\s]+)`),
    );
    if (match) return decodeURIComponent(match[1]);
  }
  throw new Error("The local account email was not saved.");
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
}

test("verification failures offer resend and stay usable on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/verify-email?token=invalid");
  await page
    .getByRole("button", { name: "Verify your email", exact: true })
    .click();
  await expect(page.locator(".form-feedback[role=alert]")).toContainText(
    "invalid or has already been used",
  );
  await expect(
    page.getByRole("button", { name: "Send verification link", exact: true }),
  ).toBeVisible();
  await noOverflow(page);
  await page.screenshot({
    path: ".data/qa/verification-error-375.png",
    fullPage: true,
  });
  await page.goto("/reset-password");
  await expect(
    page.getByRole("link", { name: "Request a new reset link", exact: true }),
  ).toBeVisible();
  await noOverflow(page);
});

test("resend, verification, password recovery and session revocation work together", async ({
  page,
  browser,
}) => {
  const email = `qa-recovery-${Date.now()}@example.test`;
  const password = "Original-QA-recovery-password";
  const replacement = "Replacement-QA-recovery-password";
  const registration = await page.request.post("/api/hub/register", {
    headers: { Origin: origin },
    data: { name: "Recovery Member", email, password, level: "300L" },
  });
  expect(registration.status()).toBe(200);
  const initial = await latestToken(email, "verify-email");
  await page.goto("/verify-email");
  await page.getByLabel("Email address", { exact: true }).fill(email);
  await page
    .getByRole("button", { name: "Send verification link", exact: true })
    .click();
  await expect(page.locator(".form-feedback")).toContainText(
    "local preview outbox",
  );
  const newest = await latestToken(email, "verify-email");
  expect(newest === initial).toBe(false);
  for (const token of [initial, newest.split(".")[0]]) {
    const rejected = await page.request.post(
      "/api/users/verify/" + encodeURIComponent(token),
      { headers: { Origin: origin }, data: {} },
    );
    expect(rejected.status()).toBe(400);
  }
  await page.goto("/verify-email?token=" + encodeURIComponent(newest));
  await page
    .getByRole("button", { name: "Verify your email", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "You’re all set.", exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await noOverflow(page);
  await page.screenshot({
    path: ".data/qa/verification-success-1440.png",
    fullPage: true,
  });
  const reused = await page.request.post(
    "/api/users/verify/" + encodeURIComponent(newest),
    { headers: { Origin: origin }, data: {} },
  );
  expect(reused.status()).toBe(400);

  const device = await browser.newContext();
  try {
    for (const client of [page.request, device.request]) {
      const login = await client.post(origin + "/api/users/login", {
        headers: { Origin: origin },
        data: { email, password },
      });
      expect(login.status()).toBe(200);
    }
    await page.goto("/forgot-password");
    await page.getByLabel("Email address", { exact: true }).fill(email);
    await page
      .getByRole("button", { name: "Send reset link", exact: true })
      .click();
    await expect(page.locator(".form-feedback")).toContainText(
      "local preview outbox",
    );
    const token = await latestToken(email, "reset-password");
    await page.goto("/reset-password?token=" + encodeURIComponent(token));
    await page.setViewportSize({ width: 375, height: 900 });
    await page.getByLabel("New password", { exact: true }).fill(replacement);
    await page
      .getByLabel("Confirm new password", { exact: true })
      .fill(replacement + "-mismatch");
    await page
      .getByRole("button", { name: "Save new password", exact: true })
      .click();
    await expect(page.locator(".form-feedback[role=alert]")).toContainText(
      "passwords do not match",
    );
    await page
      .getByLabel("Confirm new password", { exact: true })
      .fill(replacement);
    await noOverflow(page);
    await page.screenshot({
      path: ".data/qa/reset-password-375.png",
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Save new password", exact: true })
      .click();
    await expect(page).toHaveURL(/\/sign-in\?reset=success$/);
    await expect(page.locator(".form-feedback[role=status]")).toContainText(
      "Your password has been changed",
    );
    for (const client of [page.request, device.request]) {
      const me = await client.get(origin + "/api/users/me");
      expect((await me.json()).user).toBeNull();
    }
    const reusedReset = await page.request.post("/api/users/reset-password", {
      headers: { Origin: origin },
      data: { token, password },
    });
    expect(reusedReset.status()).toBe(410);
    await page.getByLabel("Email address", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(replacement);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/account$/);
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect(page).toHaveURL(/\/sign-in/);
    expect(
      (await (await page.request.get("/api/users/me")).json()).user,
    ).toBeNull();
  } finally {
    await device.close();
  }
});
