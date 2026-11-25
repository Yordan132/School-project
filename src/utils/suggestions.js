import { bookingKey, buildOccupancy, getSlots } from "./booking.js";
import { addDays, isValidDate, nightCount } from "./dates.js";
import { hotelAvailability } from "./hotels.js";

export function suggestTimeAlternatives({
  business,
  resource,
  date,
  duration,
  quantity,
  index,
  selected = null,
  ignoredId = null,
  daysAhead = 14,
  limit = 3,
}) {
  if (
    !isValidDate(date) ||
    !Number.isInteger(duration) ||
    !Number.isInteger(quantity) ||
    quantity < 1
  )
    return [];

  const suggestions = [];
  for (let offset = 0; offset <= daysAhead; offset += 1) {
    const candidateDate = addDays(date, offset);
    const bookings =
      index.get(bookingKey(business.id, resource.id, candidateDate)) || [];
    const occupancy = buildOccupancy(bookings, business.step, ignoredId);
    const slots = getSlots(
      business,
      resource,
      candidateDate,
      duration,
      quantity,
      occupancy,
    );
    for (const slot of slots) {
      if (
        !slot.available ||
        (offset === 0 && selected !== null && slot.start <= selected)
      )
        continue;
      suggestions.push({
        date: candidateDate,
        start: slot.start,
        end: slot.start + duration,
        remaining: slot.remaining,
      });
      if (suggestions.length >= limit) return suggestions;
    }
  }
  return suggestions;
}

// Проверяваме само резервациите на конкретния хотел и спираме при 3 предложения.
export function suggestHotelAlternatives({
  business,
  resourceId,
  roomTypeId,
  date,
  endDate,
  quantity,
  index,
  ignoredId = null,
  daysAhead = 14,
  limit = 3,
}) {
  const nights = nightCount(date, endDate);
  if (
    nights < 1 ||
    nights > 30 ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    limit < 1
  )
    return [];
  const resource = business.resources.find((item) => item.id === resourceId);
  const roomType = resource?.roomTypes.find((item) => item.id === roomTypeId);
  if (!resource || !roomType) return [];

  const suggestions = [];
  function add(hotel, type, arrival) {
    if (type.capacity < quantity) return;
    const departure = addDays(arrival, nights);
    const bookings = index.get(bookingKey(business.id, hotel.id, "*")) || [];
    const remaining = hotelAvailability(
      hotel,
      arrival,
      departure,
      bookings,
      ignoredId,
      type.id,
    );
    if (remaining < quantity) return;
    suggestions.push({
      resourceId: hotel.id,
      resourceName: hotel.name,
      roomTypeId: type.id,
      roomTypeName: type.name,
      date: arrival,
      endDate: departure,
      remaining,
    });
  }

  // 1. Друг вид стая в същия хотел.
  for (const type of resource.roomTypes) {
    if (type.id !== roomTypeId) add(resource, type, date);
    if (suggestions.length === limit) return suggestions;
  }
  // 2. Същият вид стая в друг хотел.
  for (const hotel of business.resources) {
    if (hotel.id === resourceId) continue;
    const type = hotel.roomTypes.find((item) => item.id === roomTypeId);
    if (type) add(hotel, type, date);
    if (suggestions.length === limit) return suggestions;
  }
  // 3. По-късно настаняване със същата продължителност.
  for (let offset = 1; offset <= daysAhead; offset++) {
    add(resource, roomType, addDays(date, offset));
    if (suggestions.length === limit) return suggestions;
  }
  // 4. Друг вид стая в друг хотел, ако все още няма достатъчно варианти.
  for (const hotel of business.resources) {
    if (hotel.id === resourceId) continue;
    for (const type of hotel.roomTypes) {
      if (type.id !== roomTypeId) add(hotel, type, date);
      if (suggestions.length === limit) return suggestions;
    }
  }
  return suggestions;
}
