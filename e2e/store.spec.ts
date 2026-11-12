import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("an available product can be added from the store and bought from its detail page", async ({
  page,
  request,
}) => {
  const access = await readFile(".data/admin-access.txt", "utf8");
  const login = await request.post("/api/users/login", {
    headers: { Origin: "http://localhost:3000" },
    data: {
      email: access.match(/Email: (.+)/)?.[1]?.trim(),
      password: access.match(/Temporary password: (.+)/)?.[1]?.trim(),
    },
  });
  expect(login.ok()).toBe(true);
  const slug = "qa-basket-" + Date.now();
  const created = await request.post("/api/products", {
    headers: { Origin: "http://localhost:3000" },
    data: {
      title: "QA basket test item",
      slug,
      description:
        "Temporary product used only for automated basket verification.",
      type: "physical",
      price: 100000,
      stock: 2,
      salesOpen: true,
      _status: "published",
      reviewStatus: "approved",
    },
  });
  expect(created.ok()).toBe(true);
  const product = (await created.json()).doc;
  try {
    await page.goto("/store?q=" + encodeURIComponent("QA basket test item"));
    await page
      .getByRole("button", { name: "Add to basket", exact: true })
      .click();
    const basket = page.getByRole("dialog", { name: "Your basket" });
    await expect(basket).toBeVisible();
    await expect(basket).toContainText("QA basket test item");
    await basket.getByRole("link", { name: "Continue to checkout" }).click();
    await expect(page).toHaveURL(/\/checkout$/);
    await expect(
      page.getByRole("link", { name: "Sign in to continue" }),
    ).toBeVisible();
    await page.reload();
    await expect(page.locator(".checkout-layout .basket-row")).toContainText(
      "QA basket test item",
    );
    await page.goto("/store/" + slug);
    await page.getByRole("button", { name: "Buy now", exact: true }).click();
    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.locator(".checkout-layout .basket-row")).toContainText(
      "QA basket test item",
    );
    await page.screenshot({
      path: ".data/qa/checkout-1440.png",
      fullPage: true,
    });
  } finally {
    const deleted = await request.delete("/api/products/" + product.id, {
      headers: { Origin: "http://localhost:3000" },
    });
    expect(deleted.ok()).toBe(true);
  }
});
