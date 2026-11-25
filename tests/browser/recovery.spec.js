import { test, expect } from "@playwright/test";

test("unreadable storage is kept until the admin explicitly resets it", async ({
  page,
}) => {
  await page.goto("/");
  const original = JSON.stringify([
    {
      id: "keep",
      businessId: "salon",
      resourceId: "maria",
      customerId: "alex",
      customer: "Алекс Иванов",
      date: "2026-12-07",
      start: 540,
      end: 570,
      quantity: 1,
    },
    { id: "broken", businessId: "unknown" },
  ]);
  await page.evaluate(
    (value) => localStorage.setItem("myasto-bookings-v2", value),
    original,
  );
  await page.reload();
  await expect(page.getByRole("alert")).toContainText("не са променени");
  await expect(
    page.getByRole("button", { name: "Потвърди резервация" }),
  ).toBeDisabled();
  expect(
    await page.evaluate(() => localStorage.getItem("myasto-bookings-v2")),
  ).toBe(original);
  await page.getByLabel("Активен профил").selectOption("admin");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page
    .getByRole("button", { name: "Възстанови примерните данни" })
    .click();
  expect(
    await page.evaluate(() => localStorage.getItem("myasto-bookings-v2")),
  ).toBe(original);
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Възстанови примерните данни" })
    .click();
  await expect(page.getByRole("status")).toContainText("възстановени");
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect(
    await page.evaluate(() => localStorage.getItem("myasto-bookings-v2")),
  ).not.toBe(original);
});

test("a legacy hotel booking can change dates without losing its six rooms", async ({
  page,
}) => {
  await page.goto("/");
  const booking = {
    id: "legacy-six",
    businessId: "hotels",
    resourceId: "city",
    customerId: "alex",
    customer: "Алекс Иванов",
    date: "2026-12-07",
    endDate: "2026-12-09",
    quantity: 6,
  };
  await page.evaluate(
    (booking) =>
      localStorage.setItem("myasto-bookings-v2", JSON.stringify([booking])),
    booking,
  );
  await page.reload();
  await page.getByRole("button", { name: /Промени резервацията/ }).click();
  await expect(page.getByLabel("Брой стаи")).toHaveValue("6");
  await expect(page.getByLabel("Вид на стаята")).toHaveValue("");
  await page.getByLabel("Настаняване", { exact: true }).fill("2026-12-08");
  await page.getByLabel("Напускане", { exact: true }).fill("2026-12-10");
  await page.getByRole("button", { name: "Запази промените" }).click();
  await expect(page.getByRole("status")).toContainText("запазени");
  await page.reload();
  await expect(page.locator(".booking-row")).toContainText("6 стаи");
  const saved = await page.evaluate(
    () => JSON.parse(localStorage.getItem("myasto-bookings-v2"))[0],
  );
  expect(saved).toEqual({
    ...booking,
    date: "2026-12-08",
    endDate: "2026-12-10",
  });
});
