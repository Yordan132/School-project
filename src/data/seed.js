import { businesses } from "./businesses.js";
import { customers } from "./profiles.js";
import { today, getSlots } from "../utils/booking.js";
import { addDays } from "../utils/dates.js";

export function createDemoBookings(date = today()) {
  return businesses.flatMap((business) =>
    business.resources.flatMap((resource, index) => {
      const customer = customers[index % customers.length];
      const common = {
        id: `demo-${business.id}-${resource.id}`,
        businessId: business.id,
        resourceId: resource.id,
        date,
        customerId: customer.id,
        customer: customer.name,
      };
      if (business.mode === "nights")
        return [{ ...common, endDate: addDays(date, 2), quantity: 1 }];
      const duration = Math.min(...business.durations);
      const quantity = Math.min(3, resource.capacity);
      const slots = getSlots(business, resource, date, duration, quantity, []);
      if (!slots.length) return [];
      const start = slots[index % slots.length].start;
      return [{ ...common, start, end: start + duration, quantity }];
    }),
  );
}
