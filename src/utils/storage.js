import { businesses } from '../data/businesses.js';
import { createDemoBookings } from '../data/seed.js';
import { validateBooking } from './booking.js';

const STORAGE_KEY = 'myasto-bookings-v1';
export function loadBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { bookings: createDemoBookings(), warning: '' };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('Invalid data');
    const accepted = [];
    for (const booking of parsed) {
      const business = businesses.find(item => item.id === booking?.businessId);
      if (!business || typeof booking.id !== 'string' || accepted.some(item => item.id === booking.id) || validateBooking(booking, business, accepted)) throw new Error('Invalid booking');
      accepted.push(booking);
    }
    return { bookings: accepted, warning: '' };
  } catch {
    return { bookings: createDemoBookings(), warning: 'Запазените данни не могат да бъдат прочетени. Заредени са примерни резервации.' };
  }
}
export function saveBookings(bookings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    return '';
  } catch {
    return 'Браузърът не позволява запис. Промените ще се загубят след презареждане.';
  }
}
