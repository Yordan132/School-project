import { isValidDate, nightCount } from "./dates.js";
export { addDays } from "./dates.js";

export function hotelAvailability(
  resource,
  arrival,
  departure,
  bookings,
  ignoredId = null,
  roomTypeId = null,
) {
  if (!isValidDate(arrival) || !isValidDate(departure) || departure <= arrival)
    return 0;
  const roomType = roomTypeId
    ? resource.roomTypes?.find((item) => item.id === roomTypeId)
    : null;
  const capacity = roomTypeId ? roomType?.capacity || 0 : resource.capacity;
  // Същият принцип като при часовете: + при начало, − при край.
  const events = [];
  for (const booking of bookings) {
    if (
      booking.resourceId !== resource.id ||
      booking.id === ignoredId ||
      (roomTypeId &&
        booking.roomType &&
        booking.roomType !== roomTypeId) ||
      booking.date >= departure ||
      booking.endDate <= arrival
    )
      continue;
    events.push([
      booking.date < arrival ? arrival : booking.date,
      booking.quantity,
    ]);
    events.push([
      booking.endDate > departure ? departure : booking.endDate,
      -booking.quantity,
    ]);
  }
  // При еднаква дата освобождаваме стаите преди новите настанявания.
  events.sort((a, b) => a[0].localeCompare(b[0]) || a[1] - b[1]);
  let occupied = 0;
  let peak = 0;
  for (const [, change] of events) {
    occupied += change;
    peak = Math.max(peak, occupied);
  }
  return Math.max(0, capacity - peak);
}

export function validateStay(booking, resource, bookings) {
  const nights = nightCount(booking.date, booking.endDate);
  if (nights < 1 || nights > 30)
    return "Изберете валидно настаняване и напускане за 1 до 30 нощувки.";
  if (
    booking.roomType !== undefined &&
    !resource.roomTypes?.some((item) => item.id === booking.roomType)
  )
    return "Изберете валиден вид стая.";
  if (
    hotelAvailability(
      resource,
      booking.date,
      booking.endDate,
      bookings,
      booking.id,
      booking.roomType,
    ) < booking.quantity
  )
    return "Недостатъчно свободни стаи от този вид за целия престой.";
  return "";
}
