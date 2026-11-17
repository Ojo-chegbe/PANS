import { test, expect } from "@playwright/test";

test("public images load from the current origin and the lightbox loads on demand", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const hero = page.locator(".hero-visual img");
  await expect(hero).toHaveAttribute("src", /^\/api\/media\/file\//);
  await expect(hero).toHaveAttribute("srcset", /320w/);
  await expect(hero).toHaveAttribute("loading", "eager");
  await expect
    .poll(() => hero.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
  expect(
    await page
      .locator('img[src*="localhost"], img[srcset*="localhost"]')
      .count(),
  ).toBe(0);

  const source = await hero.getAttribute("src");
  const response = await request.get(source!);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toMatch(/^image\//);
  expect(response.headers()["cache-control"]).toContain("public");
  expect(response.headers()["cache-control"]).toContain("s-maxage=86400");

  const lightbox = page.locator(".lightbox");
  await expect(lightbox.locator("img")).toHaveCount(0);
  const slide = page.locator(".marquee-item").first();
  await slide.scrollIntoViewIfNeeded();
  await slide.click();
  await expect(lightbox).toBeVisible();
  await expect
    .poll(() =>
      lightbox
        .locator("img")
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);
  await page.keyboard.press("Escape");
  await expect(lightbox.locator("img")).toHaveCount(0);
});
