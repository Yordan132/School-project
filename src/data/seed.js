import { businesses } from './businesses.js';
import { today, getHours } from '../utils/booking.js';

export function createDemoBookings(date = today()) {
  return businesses.flatMap(business => {
    const hours = getHours(business, date);
    if (!hours.length) return [];
    return business.resources.map((resource, index) => ({
      id: `demo-${business.id}-${resource.id}`, businessId: business.id,
      resourceId: resource.id, date, start: hours[0][0] + index * business.step,
      end: hours[0][0] + index * business.step + business.durations[0],
      quantity: resource.capacity === 1 ? 1 : 3, customer: ['Алекс Иванов', 'Елица Петрова'][index % 2],
    }));
  });
}
