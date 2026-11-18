import test from "node:test";
import assert from "node:assert/strict";
import { createBookingId } from "../src/utils/ids.js";

test("uses randomUUID when the browser supports it", () => {
  const id = "e8f4a91d-5b2c-4c7f-9a1d-1c2b3d4e5f60";
  assert.equal(createBookingId({ randomUUID: () => id }), id);
});

test("generates a UUID using getRandomValues without randomUUID", () => {
  const id = createBookingId({
    getRandomValues: (bytes) => {
      bytes.fill(0);
      return bytes;
    },
  });
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test("reports when no cryptographic ID generator exists", () => {
  assert.throws(
    () => createBookingId({}),
    /Сигурен генератор на идентификатори не е наличен/,
  );
});
