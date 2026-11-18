import React from "react";
import { businesses } from "../data/businesses.js";
import { formatTime } from "../utils/booking.js";
import { displayDate, nightCount } from "../utils/dates.js";

export default function BookingList({
  bookings,
  title = "Моите резервации",
  onEdit,
  onDelete,
}) {
  return (
    <section className="panel reservations">
      <div className="section-heading">
        <div>
          <span className="eyebrow">РЕЗЕРВАЦИИ ВЪВ ВСИЧКИ ОТДЕЛИ</span>
          <h2>{title}</h2>
        </div>
        <span className="count">{bookings.length}</span>
      </div>
      {!bookings.length ? (
        <p className="empty">Няма резервации за показване.</p>
      ) : (
        <div className="booking-list">
          {bookings.map((booking) => {
            const business = businesses.find(
              (item) => item.id === booking.businessId,
            );
            const resource = business.resources.find(
              (item) => item.id === booking.resourceId,
            );
            const hotel = business.mode === "nights";
            const roomType = resource.roomTypes?.find(
              (item) => item.id === booking.roomType,
            );
            return (
              <article
                className="booking-row"
                key={booking.id}
                data-booking-id={booking.id}
              >
                <div className="time-range">
                  <strong>{displayDate(booking.date)}</strong>
                  <span>
                    {hotel
                      ? `до ${displayDate(booking.endDate)}`
                      : `${formatTime(booking.start)}–${formatTime(booking.end)}`}
                  </span>
                </div>
                <div className="booking-person">
                  <strong>{booking.customer}</strong>
                  <span>{resource.name}</span>
                  <span>
                    {business.name}
                    {hotel
                      ? ` · ${roomType?.name || "видът не е посочен"} · ${booking.quantity} стаи · ${nightCount(booking.date, booking.endDate)} нощувки`
                      : ""}
                  </span>
                </div>
                <div className="row-actions">
                  <button
                    onClick={() => onEdit(booking)}
                    aria-label={`Промени резервацията на ${booking.customer}`}
                  >
                    Промени
                  </button>
                  <button
                    className="danger"
                    onClick={() => onDelete(booking.id)}
                    aria-label={`Откажи резервацията на ${booking.customer}`}
                  >
                    Откажи
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
