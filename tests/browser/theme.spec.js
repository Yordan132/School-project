import { test, expect } from "@playwright/test";

// Демо записите са за текущия ден. Фиксираме го, за да не зависят тестовете от календара.
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-16T12:00:00Z"));
});

test("dark mode switches, persists after reload and works on mobile", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Светъл режим" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Тъмен режим" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
