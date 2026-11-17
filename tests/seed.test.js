import test from "node:test";
import assert from "node:assert/strict";
import { businesses } from "../src/data/businesses.js";
import { createDemoBookings } from "../src/data/seed.js";
import { validateBooking } from "../src/utils/booking.js";
test("new business seeds respect small capacity and short working windows", () => {
  const business = {
    id: "short",
    step: 30,
    durations: [30],
    hours: { 1: [[540, 570]] },
    resources: [
      { id: "a", capacity: 2 },
      { id: "b", capacity: 2 },
    ],
  };
  businesses.push(business);
  try {
    const bookings = createDemoBookings("2026-11-16").filter(
      (item) => item.businessId === "short",
    );
    assert.equal(bookings.length, 2);
    for (const booking of bookings)
      assert.equal(validateBooking(booking, business, bookings), "");
  } finally {
    businesses.pop();
  }
});

test("all shipped configurations satisfy the documented grid contract", () => {
  for (const business of businesses) {
    assert.ok(business.step > 0 && 1440 % business.step === 0);
    for (const duration of business.durations)
      assert.ok(duration > 0 && duration % business.step === 0);
    for (const periods of Object.values(business.hours)) {
      let previousEnd = 0;
      for (const [start, end] of periods) {
        assert.ok(start >= previousEnd && end > start && end <= 1440);
        assert.equal(start % business.step, 0);
        assert.equal(end % business.step, 0);
        previousEnd = end;
      }
    }
    for (const resource of business.resources)
      assert.ok(Number.isInteger(resource.capacity) && resource.capacity > 0);
  }
});
