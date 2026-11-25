import { businesses } from "./businesses.js";
import { customers } from "./profiles.js";
import { today, getSlots } from "../utils/booking.js";
import { addDays } from "../utils/dates.js";

// По един пример за всеки ресурс, само когато има свободен работен интервал.
export function createDemoBookings(date = today()) {
  const bookings = [];
  for (const business of businesses) {
    for (let position = 0; position < business.resources.length; position++) {
      const resource = business.resources[position];
      const customer = customers[position % customers.length];
      const booking = {
        id: `demo-${business.id}-${resource.id}`,
        businessId: business.id,
        resourceId: resource.id,
        date,
        customerId: customer.id,
        customer: customer.name,
      };
      if (business.mode === "nights") {
        booking.endDate = addDays(date, 2);
        booking.roomType = resource.roomTypes[0].id;
        booking.quantity = 1;
      } else {
        const duration = Math.min(...business.durations);
        booking.quantity = Math.min(3, resource.capacity);
        const slots = getSlots(
          business,
          resource,
          date,
          duration,
          booking.quantity,
          [],
        );
        if (!slots.length) continue;
        booking.start = slots[position % slots.length].start;
        booking.end = booking.start + duration;
      }
      bookings.push(booking);
    }
  }
  return bookings;
}
