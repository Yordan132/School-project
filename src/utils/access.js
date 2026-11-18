import { validateBooking } from "./booking.js";

export function canManageBooking(profile, booking) {
  return Boolean(
    profile &&
    booking &&
    (profile.role === "admin" || profile.id === booking.customerId),
  );
}
export function visibleBookings(bookings, profile) {
  return bookings.filter((booking) => canManageBooking(profile, booking));
}
export function saveReservation(bookings, draft, business, profile) {
  const existing = bookings.find((booking) => booking.id === draft.id);
  if (!profile || (existing && !canManageBooking(profile, existing)))
    return { error: "Нямате право да променяте тази резервация." };
  if (!existing && profile.role !== "customer")
    return { error: "За нова резервация изберете клиентски профил." };
  const booking = {
    ...draft,
    customerId: existing ? existing.customerId : profile.id,
    customer: existing ? existing.customer : profile.name,
  };
  const error = validateBooking(booking, business, bookings);
  if (error) return { error };
  return {
    error: "",
    bookings: existing
      ? bookings.map((item) => (item.id === booking.id ? booking : item))
      : [...bookings, booking],
  };
}
export function cancelReservation(bookings, id, profile) {
  const booking = bookings.find((item) => item.id === id);
  if (!canManageBooking(profile, booking))
    return { error: "Нямате право да отменяте тази резервация." };
  return { error: "", bookings: bookings.filter((item) => item.id !== id) };
}
