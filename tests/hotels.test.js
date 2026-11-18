import test from "node:test";
import assert from "node:assert/strict";
import {
  hotelAvailability,
  validateStay,
  addDays,
} from "../src/utils/hotels.js";
const resource = { id: "hotel", capacity: 3 };
const typedResource = {
  id: "typed-hotel",
  capacity: 3,
  roomTypes: [
    { id: "single", capacity: 1 },
    { id: "double", capacity: 2 },
  ],
};
const stay = {
  id: "one",
  resourceId: "hotel",
  date: "2026-12-01",
  endDate: "2026-12-03",
  quantity: 2,
};
test("hotel checkout frees rooms for same-day arrival", () => {
  assert.equal(
    hotelAvailability(resource, "2026-12-03", "2026-12-05", [stay]),
    3,
  );
  assert.equal(
    hotelAvailability(resource, "2026-12-02", "2026-12-04", [stay]),
    1,
  );
});
test("counts peak occupancy and excludes reservation being edited", () => {
  const next = {
    ...stay,
    id: "two",
    date: "2026-12-03",
    endDate: "2026-12-05",
  };
  assert.equal(
    hotelAvailability(resource, "2026-12-01", "2026-12-05", [stay, next]),
    1,
  );
  assert.equal(
    hotelAvailability(resource, stay.date, stay.endDate, [stay], stay.id),
    3,
  );
});
test("tracks typed rooms independently while accounting for untyped legacy stays", () => {
  const doubleStay = {
    ...stay,
    resourceId: typedResource.id,
    roomType: "double",
    quantity: 2,
  };
  assert.equal(
    hotelAvailability(
      typedResource,
      stay.date,
      stay.endDate,
      [doubleStay],
      null,
      "single",
    ),
    1,
  );
  assert.equal(
    hotelAvailability(
      typedResource,
      stay.date,
      stay.endDate,
      [doubleStay],
      null,
      "double",
    ),
    0,
  );

  const legacyStay = {
    ...stay,
    resourceId: typedResource.id,
    quantity: 1,
  };
  assert.equal(
    hotelAvailability(
      typedResource,
      stay.date,
      stay.endDate,
      [legacyStay],
      null,
      "single",
    ),
    0,
  );
  assert.equal(
    hotelAvailability(
      typedResource,
      stay.date,
      stay.endDate,
      [legacyStay],
      null,
      "double",
    ),
    1,
  );
});
test("validates the selected room type and its capacity", () => {
  assert.notEqual(
    validateStay(
      { ...stay, resourceId: typedResource.id, roomType: "single", quantity: 2 },
      typedResource,
      [],
    ),
    "",
  );
  assert.notEqual(
    validateStay(
      { ...stay, resourceId: typedResource.id, roomType: "unknown" },
      typedResource,
      [],
    ),
    "",
  );
});
test("rejects reversed, impossible, empty, too long and full stays", () => {
  for (const endDate of [
    "2026-12-01",
    "2026-11-30",
    "2026-02-30",
    "",
    "2027-01-15",
  ])
    assert.notEqual(validateStay({ ...stay, endDate }, resource, []), "");
  assert.notEqual(validateStay({ ...stay, id: "other" }, resource, [stay]), "");
  assert.equal(
    validateStay({ ...stay, id: "other", quantity: 1 }, resource, [stay]),
    "",
  );
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
});
