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
