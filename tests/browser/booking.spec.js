import { test, expect } from "@playwright/test";

test("create, reload, edit and cancel; business switching and mobile layout", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto("/");
  await page.getByLabel("Дата", { exact: true }).fill("2026-11-18");
  await page.getByRole("button", { name: "09:00 1 свободни" }).click();
  await page.getByLabel("Име на клиента").fill("Тест Клиент");
  await page.getByRole("button", { name: /Потвърди резервация/ }).click();
  await expect(page.getByRole("status")).toContainText("успешно");
  await expect(
    page.getByRole("button", { name: "09:00 Заето" }),
  ).toBeDisabled();
  await page.reload();
  await page.getByLabel("Дата", { exact: true }).fill("2026-11-18");
  await expect(page.getByText("Тест Клиент", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Промени резервацията на Тест Клиент" })
    .click();
  await page.getByRole("button", { name: /Запази промените/ }).click();
  await expect(page.getByRole("status")).toContainText("Промените са запазени");
  await page
    .getByRole("button", { name: "Промени резервацията на Тест Клиент" })
    .click();
  await page.getByRole("button", { name: "10:00 1 свободни" }).click();
  await page.getByRole("button", { name: /Запази промените/ }).click();
  await expect(
    page.getByRole("button", { name: "09:00 1 свободни" }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Откажи резервацията на Тест Клиент" })
    .click();
  await expect(page.getByText("Тест Клиент", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: /Движение/ }).click();
  await page.getByLabel("Брой места").fill("8");
  await page.getByRole("button", { name: "08:00 8 свободни" }).click();
  await page.getByLabel("Име на клиента").fill("Група");
  await page.getByRole("button", { name: /Потвърди резервация/ }).click();
  await expect(
    page.getByRole("button", { name: "08:30 Заето" }),
  ).toBeDisabled();
  await page.getByLabel("Само свободни").check();
  await expect(page.getByRole("button", { name: "08:30 Заето" })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: /Медика/ }).click();
  await page.getByLabel("Дата", { exact: true }).fill("2026-11-22");
  await expect(page.getByText("Почивен ден", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Студио Линия/ }).click();
  await page.getByLabel("Дата", { exact: true }).fill("2026-11-18");
  await page.screenshot({ path: "/tmp/myasto-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByLabel("Дата", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "/tmp/myasto-mobile.png", fullPage: true });
  expect(errors).toEqual([]);
});
