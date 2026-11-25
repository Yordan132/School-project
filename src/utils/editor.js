import {
  bookingKey,
  buildOccupancy,
  getHours,
  getSlots,
  today,
} from "./booking.js";
import { addDays, nightCount } from "./dates.js";
import { hotelAvailability } from "./hotels.js";
import {
  suggestHotelAlternatives,
  suggestTimeAlternatives,
} from "./suggestions.js";

// Формата е един обект. При редакция попълваме данните от резервацията.
export function createForm(business, editing) {
  const resourceId = editing?.resourceId || business.resources[0].id;
  const resource = business.resources.find((item) => item.id === resourceId);
  const date = editing?.date || today();
  let roomTypeId = resource.roomTypes?.[0]?.id || "";
  if (editing && business.mode === "nights")
    roomTypeId = editing.roomType || "";
  let duration = business.durations?.[0] || 0;
  if (editing && business.mode === "hours")
    duration = editing.end - editing.start;
  return {
    resourceId,
    roomTypeId,
    date,
    endDate: editing?.endDate || addDays(date, 1),
    duration,
    quantity: editing?.quantity || 1,
    selected: editing?.start ?? null,
  };
}

// Старите записи нямат вид стая. Позволяваме да се редактират, без да губят стаи.
export function getRoomTypes(resource, editing) {
  const types = resource.roomTypes || [];
  if (
    !editing?.endDate ||
    editing.roomType ||
    editing.resourceId !== resource.id
  )
    return types;
  return [
    {
      id: "",
      name: "Без посочен вид (стар запис)",
      capacity: resource.capacity,
    },
    ...types,
  ];
}

// Това са обикновени функции без React: входни данни -> свободни места и предложения.
export function getAvailability(business, form, index, editing) {
  const resource = business.resources.find(
    (item) => item.id === form.resourceId,
  );
  if (business.mode === "nights")
    return getHotelOptions(business, resource, form, index, editing);
  return getTimeOptions(business, resource, form, index, editing);
}

function getTimeOptions(business, resource, form, index, editing) {
  const { date, duration, quantity, selected } = form;
  const bookings = index.get(bookingKey(business.id, resource.id, date)) || [];
  const occupancy = buildOccupancy(bookings, business.step, editing?.id);
  const slots = getSlots(
    business,
    resource,
    date,
    duration,
    quantity,
    occupancy,
  );
  const validQuantity =
    Number.isInteger(quantity) &&
    quantity >= 1 &&
    quantity <= resource.capacity;
  const available =
    validQuantity &&
    slots.some((slot) => slot.start === selected && slot.available);
  let suggestions = [];
  if (
    !available &&
    (slots.length === 0 || slots.some((slot) => !slot.available))
  ) {
    suggestions = suggestTimeAlternatives({
      business,
      resource,
      date,
      duration,
      quantity,
      index,
      selected:
        selected ?? slots.find((slot) => !slot.available)?.start ?? null,
      ignoredId: editing?.id,
    });
  }
  return {
    resource,
    slots,
    available,
    suggestions,
    hours: getHours(business, date),
  };
}

function getHotelOptions(business, resource, form, index, editing) {
  const { roomTypeId, date, endDate, quantity } = form;
  const roomTypes = getRoomTypes(resource, editing);
  const roomType = roomTypes.find((item) => item.id === roomTypeId);
  const bookings = index.get(bookingKey(business.id, resource.id, "*")) || [];
  const remaining = hotelAvailability(
    resource,
    date,
    endDate,
    bookings,
    editing?.id,
    roomTypeId,
  );
  const nights = nightCount(date, endDate);
  const validPeriod = nights >= 1 && nights <= 30;
  const validQuantity =
    Number.isInteger(quantity) &&
    quantity >= 1 &&
    quantity <= roomType.capacity;
  const available = validPeriod && validQuantity && remaining >= quantity;
  let suggestions = [];
  if (roomTypeId && validPeriod && remaining < quantity) {
    suggestions = suggestHotelAlternatives({
      business,
      resourceId: resource.id,
      roomTypeId,
      date,
      endDate,
      quantity,
      index,
      ignoredId: editing?.id,
    });
  }
  return {
    resource,
    roomType,
    roomTypes,
    nights,
    validPeriod,
    remaining,
    available,
    suggestions,
  };
}
