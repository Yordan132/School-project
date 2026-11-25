import { test, expect } from "@playwright/test";

// Демо записите са за текущия ден. Фиксираме го, за да не зависят тестовете от календара.
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-16T12:00:00Z"));
});

test("customers own their appointments; admin sees everyone and filters reservations", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto("/");
  await expect(
    page.locator(".resource-card").filter({ hasText: /Д-р/ }),
  ).toHaveCount(3);
  await page.getByRole("button", { name: /Фризьорски отдел/ }).click();
  await expect(page.locator(".resource-card")).toHaveCount(3);
  await page.getByLabel("Дата", { exact: true }).fill("2026-12-07");
  await page.getByRole("button", { name: "09:00 1 свободни" }).click();
  await page.getByRole("button", { name: /Потвърди резервация/ }).click();
  await expect(page.getByRole("status")).toContainText("успешно");
  await page.getByLabel("Активен профил").selectOption("boris");
  await expect(
    page.locator(".booking-row").filter({ hasText: "Алекс Иванов" }),
  ).toHaveCount(0);
  await page.getByLabel("Дата", { exact: true }).fill("2026-12-07");
  await expect(
    page.getByRole("button", { name: "09:00 Заето" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "09:30 1 свободни" }).click();
  await page.getByRole("button", { name: /Потвърди резервация/ }).click();
  await page.reload();
  await expect(page.getByLabel("Активен профил")).toHaveValue("boris");
  const own = page.locator(".booking-row").filter({ hasText: "07.12.2026" });
  await expect(own).toHaveCount(1);
  await own.getByRole("button", { name: /Промени/ }).click();
  await page.getByRole("button", { name: /Запази промените/ }).click();
  await expect(page.getByRole("status")).toContainText("Промените са запазени");
  await own.getByRole("button", { name: /Промени/ }).click();
  await page.getByRole("button", { name: "10:00 1 свободни" }).click();
  await page.getByRole("button", { name: /Запази промените/ }).click();
  await page.getByLabel("Активен профил").selectOption("admin");
  await expect(
    page.getByRole("heading", { name: "Всички клиенти", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".customer-card")).toHaveCount(3);
  await expect(
    page.getByRole("combobox", { name: "Отдел", exact: true }),
  ).toHaveCount(0);
  await page.getByLabel("Дата / нощувка").fill("2026-12-07");
  await expect(page.locator(".booking-row")).toHaveCount(2);
  await page
    .getByRole("combobox", { name: "Вид услуга", exact: true })
    .selectOption("Здраве");
  await expect(page.locator(".booking-row")).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Вид услуга", exact: true })
    .selectOption("Стил");
  await expect(page.locator(".booking-row")).toHaveCount(2);
  await page
    .getByRole("combobox", { name: "Клиент", exact: true })
    .selectOption("alex");
  await expect(page.locator(".booking-row")).toHaveCount(1);
  await page.getByLabel("Активен профил").selectOption("alex");
  await expect(
    page.locator(".booking-row").filter({ hasText: "Борис Георгиев" }),
  ).toHaveCount(0);
  await page
    .locator(".booking-row")
    .filter({ hasText: "07.12.2026" })
    .getByRole("button", { name: /Откажи/ })
    .click();
  await expect(
    page.locator(".booking-row").filter({ hasText: "07.12.2026" }),
  ).toHaveCount(0);
  await page.getByLabel("Активен профил").selectOption("boris");
  await expect(
    page.locator(".booking-row").filter({ hasText: "07.12.2026" }),
  ).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("hotel nights, full capacity, checkout adjacency, admin editing and mobile", async ({
  page,
}) => {
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto("/");
  await page.getByRole("button", { name: /Хотелски отдел/ }).click();
  await expect(page.locator(".resource-card")).toHaveCount(3);
  await page.getByRole("button", { name: /Хотел Хармония/ }).click();
  await page.getByLabel("Вид на стаята").selectOption("studio");
  await page.getByLabel("Настаняване", { exact: true }).fill("2026-12-07");
  await page.getByLabel("Напускане", { exact: true }).fill("2026-12-09");
  await page.getByLabel("Брой стаи").fill("3");
  await page.getByRole("button", { name: /Потвърди резервация/ }).click();
  await expect(page.getByRole("status")).toContainText("успешно");
  const stay = page.locator(".booking-row").filter({ hasText: "07.12.2026" });
  await expect(stay).toContainText("Студио");
  await expect(stay).toContainText("2 нощувки");
  await page.getByLabel("Активен профил").selectOption("boris");
  await page.getByRole("button", { name: /Хотел Хармония/ }).click();
  await page.getByLabel("Вид на стаята").selectOption("studio");
  await page.getByLabel("Настаняване", { exact: true }).fill("2026-12-08");
  await page.getByLabel("Напускане", { exact: true }).fill("2026-12-10");
  await expect(
    page.getByRole("button", { name: /Потвърди резервация/ }),
  ).toBeDisabled();
  const alternative = page.getByRole("button", {
    name: /Хотел Хармония.*Единична/,
  });
  await expect(alternative).toBeVisible();
  await alternative.click();
  await expect(page.getByLabel("Вид на стаята")).toHaveValue("single");
  await expect(
    page.getByRole("button", { name: /Потвърди резервация/ }),
  ).toBeEnabled();
  await page.getByRole("button", { name: /Потвърди резервация/ }).click();
  await expect(page.getByRole("status")).toContainText("успешно");
  await page.getByLabel("Вид на стаята").selectOption("studio");
  await page.getByLabel("Настаняване", { exact: true }).fill("2026-12-09");
  await page.getByLabel("Напускане", { exact: true }).fill("2026-12-10");
  await expect(
    page.getByRole("button", { name: /Потвърди резервация/ }),
  ).toBeEnabled();
  await page.getByLabel("Активен профил").selectOption("admin");
  await page.getByLabel("Дата / нощувка").fill("2026-12-08");
  await expect(page.locator(".booking-row")).toHaveCount(2);
  await stay.getByRole("button", { name: /Промени/ }).click();
  await page.getByRole("button", { name: /Запази промените/ }).click();
  await expect(page.getByRole("status")).toContainText("Промените са запазени");
  await expect(stay).toContainText("Алекс Иванов");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "/tmp/myasto-admin-mobile.png",
    fullPage: true,
  });
  await page.getByLabel("Активен профил").selectOption("alex");
  await page.getByRole("button", { name: /Хотелски отдел/ }).click();
  await page.screenshot({
    path: "/tmp/myasto-customer-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await stay.getByRole("button", { name: /Откажи/ }).click();
  await page.getByRole("button", { name: /Хотел Хармония/ }).click();
  await page.getByLabel("Настаняване", { exact: true }).fill("2026-12-07");
  await page.getByLabel("Напускане", { exact: true }).fill("2026-12-09");
  await page.getByLabel("Вид на стаята").selectOption("studio");
  await expect(page.locator(".hotel-availability>strong")).toHaveText("3");
});

test("closed days offer a next available time that can be selected", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Дата", { exact: true }).fill("2026-12-06");
  const suggestions = page.getByRole("region", {
    name: "Предложени часове",
  });
  await expect(suggestions).toBeVisible();
  const nextTime = suggestions.getByRole("button", {
    name: /07\.12\.2026.*08:00/,
  });
  await expect(nextTime).toBeVisible();
  await nextTime.click();
  await expect(page.getByLabel("Дата", { exact: true })).toHaveValue(
    "2026-12-07",
  );
  await expect(
    page.getByRole("button", { name: /Потвърди резервация/ }),
  ).toBeEnabled();
});

test("hour confirmation works without crypto.randomUUID", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window.crypto, "randomUUID", {
      configurable: true,
      value: undefined,
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: /Фризьорски отдел/ }).click();
  await page.getByLabel("Дата", { exact: true }).fill("2026-12-07");
  await page.getByRole("button", { name: "09:00 1 свободни" }).click();
  await page.getByRole("button", { name: /Потвърди резервация/ }).click();
  await expect(page.getByRole("status")).toContainText("успешно");
  await expect(
    page.locator(".booking-row").filter({ hasText: "07.12.2026" }),
  ).toHaveCount(1);
});
