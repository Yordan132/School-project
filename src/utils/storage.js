import { businesses } from "../data/businesses.js";
import { createDemoBookings } from "../data/seed.js";
import { validateBooking } from "./booking.js";

const STORAGE_KEY = "myasto-bookings-v2";
import { customers } from "../data/profiles.js";
export function loadBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null)
      return {
        bookings: createDemoBookings(),
        warning: localStorage.getItem("myasto-bookings-v1")
          ? "Заредени са новите отдели и демо профили. Старите данни са запазени отделно в браузъра."
          : "",
      };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Invalid data");
    const accepted = [];
    for (const booking of parsed) {
      const business = businesses.find(
        (item) => item.id === booking?.businessId,
      );
      if (
        !business ||
        !customers.some(
          (customer) =>
            customer.id === booking.customerId &&
            customer.name === booking.customer,
        ) ||
        typeof booking.id !== "string" ||
        accepted.some((item) => item.id === booking.id) ||
        validateBooking(booking, business, accepted)
      )
        throw new Error("Invalid booking");
      accepted.push(booking);
    }
    return { bookings: accepted, warning: "" };
  } catch {
    return {
      bookings: createDemoBookings(),
      storageBlocked: true,
      warning:
        "Запазените данни не могат да бъдат прочетени и не са променени. Показани са временни примери. За ново начало администраторът може да възстанови примерните данни.",
    };
  }
}
export function saveBookings(bookings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    return "";
  } catch {
    return "Браузърът не позволява запис. Промените ще се загубят след презареждане.";
  }
}
