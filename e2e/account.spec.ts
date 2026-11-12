import { test, expect, type APIRequestContext } from "@playwright/test";
import { readFile, readdir } from "node:fs/promises";
const email = "qa-member-" + Date.now() + "@example.test";
const password = "QA-only-long-password-" + Date.now();
async function adminLogin(request: APIRequestContext) {
  const access = await readFile(".data/admin-access.txt", "utf8");
  const email = access.match(/Email: (.+)/)?.[1]?.trim();
  const password = access.match(/Temporary password: (.+)/)?.[1]?.trim();
  if (!email || !password)
    throw new Error("Create a local administrator before the browser checks.");
  const response = await request.post("/api/users/login", {
    headers: { Origin: "http://localhost:3000" },
    data: { email, password },
  });
  expect(response.status()).toBe(200);
}

test("protected account links preserve their destination when signing in", async ({
  page,
}) => {
  await page.goto("/account/orders/999999");
  await expect(page).toHaveURL(/\/sign-in\?next=%2Faccount%2Forders%2F999999$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
test("a member can verify, sign in, update a profile and track a mentorship request", async ({
  page,
}) => {
  await page.goto("/join");
  await page.getByLabel("Full name", { exact: true }).fill("QA Member");
  await page.getByLabel("Email address", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.locator('input[name="consent"]').check();
  await page
    .getByRole("button", { name: "Create your account", exact: true })
    .click();
  await expect(page.locator(".form-feedback")).toContainText(
    /Check your email|Your registration request is complete/,
    { timeout: 60000 },
  );
  const files = (await readdir(".data/mail")).sort().reverse();
  let token = "";
  for (const file of files.slice(0, 50)) {
    const mail = JSON.parse(await readFile(".data/mail/" + file, "utf8"));
    if (JSON.stringify(mail.to).includes(email)) {
      const match = String(mail.html).match(/verify-email\?token=([^"<\s]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
        break;
      }
    }
  }
  expect(Boolean(token)).toBe(true);
  await page.goto("/verify-email?token=" + encodeURIComponent(token));
  await page
    .getByRole("button", { name: "Verify your email", exact: true })
    .click();
  await expect(page.locator(".verification-result[role=status]")).toContainText(
    "Your email is verified",
  );
  await page.goto("/sign-in");
  await page.getByLabel("Email address", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(
    page.getByRole("heading", { name: "Welcome, QA.", exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: ".data/qa/account-1440.png", fullPage: true });
  await page.setViewportSize({ width: 375, height: 900 });
  await expect(page.getByLabel("Account page", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.screenshot({ path: ".data/qa/account-375.png", fullPage: true });
  await page
    .getByLabel("Account page", { exact: true })
    .selectOption("/account/profile");
  await expect(page).toHaveURL(/\/account\/profile$/);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/account/profile");
  await page.screenshot({ path: ".data/qa/profile-1440.png", fullPage: true });
  await page.getByLabel("Phone number", { exact: true }).fill("00000000000");
  await page.getByLabel("Your level", { exact: true }).selectOption("300L");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.locator(".form-feedback")).toContainText(
    "Your profile has been updated.",
  );
  await page.reload();
  await expect(page.getByLabel("Your level", { exact: true })).toHaveValue(
    "300L",
  );
  await page.goto("/mentorship");
  await page
    .getByLabel("What would you like help with?", { exact: true })
    .fill("I would like guidance on planning my pharmacy research project.");
  await page
    .getByRole("button", { name: "Send your request", exact: true })
    .click();
  await expect(page).toHaveURL(/\/account\/mentorship$/);
  await expect(page.locator(".record-list:visible")).toContainText("submitted");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/sign-in/);
});
test("administration uses the PANS content models and homepage editor", async ({
  page,
  request,
}) => {
  await adminLogin(request);
  await page.context().addCookies((await request.storageState()).cookies);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", {
      name: "Your community, at a glance.",
      exact: true,
    }),
  ).toBeVisible();
  await page.screenshot({ path: ".data/qa/admin-1440.png" });
  await page.goto("/admin/globals/home");
  await expect(
    page.getByRole("heading", { name: "Homepage", exact: true }),
  ).toBeVisible();
  await expect(page.locator("textarea").first()).toHaveValue(
    "Together, we build\na better future.",
  );
  await page.goto("/admin/collections/products");
  await expect(
    page.getByRole("heading", { name: "Products", exact: true }),
  ).toBeVisible();
});
test.afterAll(async ({ request }) => {
  await adminLogin(request);
  const found = await request.get(
    "/api/users?where[email][equals]=" + encodeURIComponent(email),
    { headers: { Origin: "http://localhost:3000" } },
  );
  const user = (await found.json()).docs?.[0];
  if (!user) return;
  for (const collection of [
    "mentorship-requests",
    "notifications",
    "event-interests",
    "carts",
  ]) {
    const response = await request.delete(
      "/api/" + collection + "?where[owner][equals]=" + user.id,
      { headers: { Origin: "http://localhost:3000" } },
    );
    expect(response.ok(), collection + " cleanup").toBe(true);
  }
  const jobs = await request.get("/api/payload-jobs?limit=100", {
    headers: { Origin: "http://localhost:3000" },
  });
  if (jobs.ok())
    for (const job of (await jobs.json()).docs || [])
      if (job.input?.to === email)
        await request.delete("/api/payload-jobs/" + job.id, {
          headers: { Origin: "http://localhost:3000" },
        });
  await request.delete("/api/users/" + user.id, {
    headers: { Origin: "http://localhost:3000" },
  });
});
