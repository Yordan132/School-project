import test from "node:test";
import assert from "node:assert/strict";
import { loadBookings, saveBookings } from "../src/utils/storage.js";

test("round trips an empty dataset without restoring demo bookings", () => {
  let value = null;
  globalThis.localStorage = {
    getItem: () => value,
    setItem: (_, next) => {
      value = next;
    },
  };
  assert.equal(saveBookings([]), "");
  assert.deepEqual(loadBookings(), { bookings: [], warning: "" });
  delete globalThis.localStorage;
});
test("reports corrupt persisted data and unavailable storage", () => {
  globalThis.localStorage = {
    getItem: () => "{broken",
    setItem: () => {
      throw new Error("quota");
    },
  };
  assert.notEqual(loadBookings().warning, "");
  assert.notEqual(saveBookings([]), "");
  delete globalThis.localStorage;
});

test("rejects hourly bookings containing hotel dates before indexing them", () => {
  const records = [
    {
      id: "mixed",
      businessId: "salon",
      resourceId: "maria",
      customerId: "alex",
      customer: "Алекс Иванов",
      date: "2026-12-07",
      start: 540,
      end: 570,
      quantity: 1,
      endDate: "2026-12-09",
    },
  ];
  globalThis.localStorage = {
    getItem: (key) =>
      key === "myasto-bookings-v2" ? JSON.stringify(records) : null,
  };
  try {
    assert.notEqual(loadBookings().warning, "");
  } finally {
    delete globalThis.localStorage;
  }
});

test("v1 reservations remain untouched and are not silently assigned an owner", () => {
  const old = '[{"id":"legacy"}]';
  const values = new Map([["myasto-bookings-v1", old]]);
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  try {
    const loaded = loadBookings();
    assert.notEqual(loaded.warning, "");
    saveBookings(loaded.bookings);
    assert.equal(values.get("myasto-bookings-v1"), old);
    assert.ok(loaded.bookings.every((booking) => booking.customerId));
  } finally {
    delete globalThis.localStorage;
  }
});
