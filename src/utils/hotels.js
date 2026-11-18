import { isValidDate, nightCount } from "./dates.js";
export { addDays } from "./dates.js";

export function hotelAvailability(
  resource,
  arrival,
  departure,
  bookings,
  ignoredId = null,
) {
  if (!isValidDate(arrival) || !isValidDate(departure) || departure <= arrival)
    return 0;
  // Същият принцип като при часовете: + при начало, − при край.
  const events = [];
  for (const booking of bookings) {
    if (
      booking.resourceId !== resource.id ||
      booking.id === ignoredId ||
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
  return resource.capacity - peak;
}

export function validateStay(booking, resource, bookings) {
  const nights = nightCount(booking.date, booking.endDate);
  if (nights < 1 || nights > 30)
    return "Изберете валидно настаняване и напускане за 1 до 30 нощувки.";
  if (
    hotelAvailability(
      resource,
      booking.date,
      booking.endDate,
      bookings,
      booking.id,
    ) < booking.quantity
  )
    return "Недостатъчно свободни стаи за целия престой.";
  return "";
}
