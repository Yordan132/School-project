import { businesses } from "../data/businesses.js";
import { createDemoBookings } from "../data/seed.js";
import { validateBooking } from "./booking.js";

import { customers } from "../data/profiles.js";

const STORAGE_KEY = "myasto-bookings-v2";
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
      const customer = customers.find(
        (item) => item.id === booking?.customerId,
      );
      if (!business || !customer || customer.name !== booking.customer)
        throw new Error("Invalid owner or department");
      if (typeof booking.id !== "string") throw new Error("Invalid ID");
      if (accepted.some((item) => item.id === booking.id))
        throw new Error("Duplicate ID");
      if (validateBooking(booking, business, accepted))
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
