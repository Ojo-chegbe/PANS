import { test, expect } from "@playwright/test";
import { readFile, mkdir } from "node:fs/promises";
test("the supplied mock and implementation are captured for comparison", async ({
  page,
}) => {
  await mkdir(".data/qa", { recursive: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  const html = await readFile("PANS_Digital_Hub_new.html", "utf8");
  await page.route("**/__mock-reference", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: html }),
  );
  await page.goto("/__mock-reference");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: ".data/qa/reference-1440.png",
    fullPage: true,
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Together, we build",
  );
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: ".data/qa/home-1440.png", fullPage: true });
});
for (const width of [320, 375, 390, 414, 768, 1024, 1440])
  test("homepage remains usable at " + width + "px", async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    if (width === 375)
      await page.screenshot({ path: ".data/qa/home-375.png", fullPage: true });
    if (width < 1200) {
      await page.getByRole("button", { name: "Menu", exact: true }).click();
      await expect(page.locator("#main-navigation")).toBeVisible();
      await page
        .locator("#main-navigation")
        .getByRole("link", { name: "Events", exact: true })
        .click();
      await expect(page).toHaveURL(/\/events$/);
    }
  });
test("store details and public content links work", async ({ page }) => {
  await page.goto("/store");
  await page.getByRole("link", { name: "Web Design", exact: true }).click();
  await expect(page).toHaveURL(/\/store\/web-design$/);
  await expect(
    page.getByRole("heading", { name: "Web Design", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("The course outline is being prepared."),
  ).toBeVisible();
  for (const route of [
    "/resources",
    "/opportunities",
    "/legacy",
    "/community",
    "/about",
    "/contact",
    "/mentorship",
    "/privacy",
    "/terms",
    "/refunds",
  ]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});
test("global search finds the imported catalogue", async ({ page }) => {
  await page.goto("/search?q=Web%20Design");
  await expect(
    page
      .locator(".search-results")
      .getByRole("heading", { name: "Web Design", exact: true }),
  ).toBeVisible();
});
