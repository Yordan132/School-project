// Часовете са минути от началото на деня: 09:30 = 570.
export function formatTime(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export function getHours(business, date) {
  if (!isValidDate(date)) return [];
  return business.hours[new Date(`${date}T12:00:00Z`).getUTCDay()] || [];
}

export function bookingKey(businessId, resourceId, date) {
  return JSON.stringify([businessId, resourceId, date]);
}

export function buildIndex(bookings) {
  const index = new Map();
  for (const booking of bookings) {
    const key = bookingKey(
      booking.businessId,
      booking.resourceId,
      booking.date,
    );
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(booking);
  }
  return index;
}

// Разликите отбелязват само началото и края. Един обход намира заетостта.
export function buildOccupancy(bookings, step, ignoredId = null) {
  const changes = Array(1440 / step + 1).fill(0);
  for (const booking of bookings) {
    if (booking.id === ignoredId) continue;
    changes[booking.start / step] += booking.quantity;
    changes[booking.end / step] -= booking.quantity;
  }
  let occupied = 0;
  return changes.slice(0, -1).map((change) => (occupied += change));
}

function remainingCapacity(resource, start, end, step, occupancy) {
  let peak = 0;
  for (let cell = start / step; cell < end / step; cell++) {
    peak = Math.max(peak, occupancy[cell] || 0);
  }
  return resource.capacity - peak;
}

export function getSlots(
  business,
  resource,
  date,
  duration,
  quantity,
  occupancy,
) {
  const slots = [];
  if (!business.durations.includes(duration)) return slots;
  for (const [open, close] of getHours(business, date)) {
    for (let start = open; start + duration <= close; start += business.step) {
      const remaining = remainingCapacity(
        resource,
        start,
        start + duration,
        business.step,
        occupancy,
      );
      slots.push({ start, remaining, available: remaining >= quantity });
    }
  }
  return slots;
}

export function validateBooking(booking, business, bookings) {
  const resource = business.resources.find(
    (item) => item.id === booking.resourceId,
  );
  if (booking.businessId !== business.id || !resource)
    return "Невалиден ресурс или бизнес.";
  if (!isValidDate(booking.date)) return "Изберете валидна дата.";
  if (
    typeof booking.customer !== "string" ||
    !booking.customer.trim() ||
    booking.customer.length > 80
  )
    return "Въведете име до 80 символа.";
  if (
    !Number.isInteger(booking.quantity) ||
    booking.quantity < 1 ||
    booking.quantity > resource.capacity
  )
    return "Невалиден брой места за този капацитет.";
  const { start, end } = booking;
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end > 1440 ||
    start % business.step ||
    end % business.step ||
    !business.durations.includes(end - start)
  )
    return "Невалиден час или продължителност.";
  if (
    !getHours(business, booking.date).some(
      ([open, close]) => start >= open && end <= close,
    )
  )
    return "Часът е извън работното време или в почивка.";
  const relevant = bookings.filter(
    (item) =>
      item.businessId === business.id &&
      item.resourceId === resource.id &&
      item.date === booking.date,
  );
  const occupancy = buildOccupancy(relevant, business.step, booking.id);
  if (
    remainingCapacity(resource, start, end, business.step, occupancy) <
    booking.quantity
  )
    return "Недостатъчен свободен капацитет. Изберете друг час.";
  return "";
}
