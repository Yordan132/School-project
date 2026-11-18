import test from "node:test";
import assert from "node:assert/strict";
import { buildIndex } from "../src/utils/booking.js";
import {
  suggestHotelAlternatives,
  suggestTimeAlternatives,
} from "../src/utils/suggestions.js";

const hotelBusiness = {
  id: "hotels",
  resources: [
    {
      id: "city",
      name: "Хотел Централ",
      roomTypes: [
        { id: "single", name: "Единична", capacity: 1 },
        { id: "double", name: "Двойна", capacity: 2 },
      ],
    },
    {
      id: "spa",
      name: "Хотел Хармония",
      roomTypes: [
        { id: "single", name: "Единична", capacity: 1 },
        { id: "double", name: "Двойна", capacity: 2 },
      ],
    },
  ],
};

test("hotel alternatives cover another type, hotel and nearby dates", () => {
  const booking = {
    id: "full",
    businessId: "hotels",
    resourceId: "city",
    roomType: "double",
    date: "2026-12-07",
    endDate: "2026-12-09",
    quantity: 2,
  };
  const suggestions = suggestHotelAlternatives({
    business: hotelBusiness,
    resourceId: "city",
    roomTypeId: "double",
    date: booking.date,
    endDate: booking.endDate,
    quantity: 2,
    bookings: [booking],
  });
  assert.ok(
    suggestions.some(
      (item) =>
        item.resourceId === "spa" &&
        item.roomTypeId === "double" &&
        item.date === booking.date,
    ),
  );
  assert.ok(
    suggestions.some(
      (item) =>
        item.resourceId === "city" &&
        item.roomTypeId === "double" &&
        item.date !== booking.date,
    ),
  );
});

test("time alternatives offer later slots and search upcoming open days", () => {
  const business = {
    id: "salon",
    step: 30,
    durations: [30],
    hours: { 1: [[540, 600]], 2: [[540, 600]] },
  };
  const resource = { id: "stylist", capacity: 1 };
  const firstDayBookings = [
    {
      id: "first",
      businessId: business.id,
      resourceId: resource.id,
      date: "2026-12-07",
      start: 540,
      end: 570,
      quantity: 1,
    },
    {
      id: "second",
      businessId: business.id,
      resourceId: resource.id,
      date: "2026-12-07",
      start: 570,
      end: 600,
      quantity: 1,
    },
  ];
  const index = buildIndex(firstDayBookings);
  const laterSameDay = suggestTimeAlternatives({
    business,
    resource,
    date: "2026-12-07",
    duration: 30,
    quantity: 1,
    index: buildIndex([firstDayBookings[0]]),
    selected: 540,
    limit: 1,
  });
  assert.deepEqual(laterSameDay, [
    {
      date: "2026-12-07",
      start: 570,
      end: 600,
      remaining: 1,
    },
  ]);
  const nextDay = suggestTimeAlternatives({
    business,
    resource,
    date: "2026-12-07",
    duration: 30,
    quantity: 1,
    index,
    selected: 540,
    limit: 1,
  });
  assert.deepEqual(nextDay, [
    {
      date: "2026-12-08",
      start: 540,
      end: 570,
      remaining: 1,
    },
  ]);
});
