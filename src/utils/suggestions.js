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
  selected,
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

export function suggestHotelAlternatives({
  business,
  resourceId,
  roomTypeId,
  date,
  endDate,
  quantity,
  bookings,
  ignoredId = null,
  daysAhead = 14,
  limit = 3,
}) {
  const nights = nightCount(date, endDate);
  if (
    !isValidDate(date) ||
    nights < 1 ||
    nights > 30 ||
    !Number.isInteger(quantity) ||
    quantity < 1
  )
    return [];

  const resource = business.resources.find((item) => item.id === resourceId);
  const roomType = resource?.roomTypes?.find(
    (item) => item.id === roomTypeId,
  );
  if (!resource || !roomType) return [];

  const suggestions = [];
  const seen = new Set();
  function add(candidateResource, candidateType, arrival) {
    const departure = addDays(arrival, nights);
    const available = hotelAvailability(
      candidateResource,
      arrival,
      departure,
      bookings,
      ignoredId,
      candidateType.id,
    );
    const key = `${candidateResource.id}:${candidateType.id}:${arrival}`;
    if (available < quantity || seen.has(key)) return;
    seen.add(key);
    suggestions.push({
      resourceId: candidateResource.id,
      resourceName: candidateResource.name,
      roomTypeId: candidateType.id,
      roomTypeName: candidateType.name,
      date: arrival,
      endDate: departure,
      remaining: available,
    });
  }

  for (const candidateType of resource.roomTypes) {
    if (candidateType.id !== roomTypeId)
      add(resource, candidateType, date);
  }
  for (const candidateResource of business.resources) {
    if (candidateResource.id === resourceId) continue;
    const matchingType = candidateResource.roomTypes.find(
      (item) => item.id === roomTypeId,
    );
    if (matchingType) add(candidateResource, matchingType, date);
  }
  for (let offset = 1; offset <= daysAhead; offset += 1)
    add(resource, roomType, addDays(date, offset));
  if (suggestions.length < limit) {
    for (const candidateResource of business.resources) {
      if (candidateResource.id === resourceId) continue;
      for (const candidateType of candidateResource.roomTypes) {
        if (candidateType.id !== roomTypeId) add(candidateResource, candidateType, date);
      }
    }
  }
  return suggestions.slice(0, limit);
}
