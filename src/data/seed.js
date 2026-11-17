import { businesses } from "./businesses.js";
import { today, getSlots } from "../utils/booking.js";

export function createDemoBookings(date = today()) {
  return businesses.flatMap((business) =>
    business.resources.flatMap((resource, index) => {
      const duration = Math.min(...business.durations);
      const quantity = Math.min(3, resource.capacity);
      const slots = getSlots(business, resource, date, duration, quantity, []);
      if (!slots.length) return [];
      const start = slots[index % slots.length].start;
      return [
        {
          id: `demo-${business.id}-${resource.id}`,
          businessId: business.id,
          resourceId: resource.id,
          date,
          start,
          end: start + duration,
          quantity,
          customer: ["Алекс Иванов", "Елица Петрова"][index % 2],
        },
      ];
    }),
  );
}
