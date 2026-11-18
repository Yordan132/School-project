import test from "node:test";
import assert from "node:assert/strict";
import {
  visibleBookings,
  canManageBooking,
  saveReservation,
  cancelReservation,
} from "../src/utils/access.js";
const alice = { id: "alice", name: "Алекс", role: "customer" };
const bob = { id: "bob", name: "Борис", role: "customer" };
const admin = { id: "admin", name: "Админ", role: "admin" };
const business = {
  id: "demo",
  step: 30,
  durations: [30],
  hours: { 1: [[540, 1080]] },
  resources: [{ id: "r", capacity: 1 }],
};
const booking = {
  id: "a",
  customerId: "alice",
  customer: "Алекс",
  businessId: "demo",
  resourceId: "r",
  date: "2026-12-07",
  start: 540,
  end: 570,
  quantity: 1,
};
test("customers can only see and manage their bookings; admin can see all", () => {
  assert.deepEqual(visibleBookings([booking], bob), []);
  assert.deepEqual(visibleBookings([booking], alice), [booking]);
  assert.deepEqual(visibleBookings([booking], admin), [booking]);
  assert.equal(canManageBooking(bob, booking), false);
  assert.equal(canManageBooking(admin, booking), true);
});
test("action layer rejects another customers edit and cancellation", () => {
  assert.ok(saveReservation([booking], booking, business, bob).error);
  assert.ok(cancelReservation([booking], booking.id, bob).error);
  assert.deepEqual(
    cancelReservation([booking], booking.id, alice).bookings,
    [],
  );
});
test("creation binds owner to active profile and still checks other customers conflicts", () => {
  const draft = {
    ...booking,
    id: "new",
    customerId: "alice",
    customer: "Подменено",
    start: 570,
    end: 600,
  };
  const result = saveReservation([booking], draft, business, bob);
  assert.equal(result.error, "");
  assert.equal(result.bookings[1].customerId, "bob");
  assert.equal(result.bookings[1].customer, "Борис");
  assert.ok(
    saveReservation(
      [booking],
      { ...draft, start: 540, end: 570 },
      business,
      bob,
    ).error,
  );
});
