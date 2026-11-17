import React from 'react';
import { formatTime } from '../utils/booking.js';

export default function BookingList({ bookings, business, onEdit, onDelete }) {
  return <section className="panel reservations"><div className="section-heading"><div><span className="eyebrow">ВАШИЯТ ГРАФИК</span><h2>Резервации за деня</h2></div><span className="count">{bookings.length}</span></div>
    {!bookings.length ? <p className="empty">Все още няма резервации за този ден.</p> : <div className="booking-list">{bookings.map(booking => <article className="booking-row" key={booking.id}>
      <div className="time-range"><strong>{formatTime(booking.start)}</strong><span>{formatTime(booking.end)}</span></div>
      <div className="booking-person"><strong>{booking.customer}</strong><span>{business.resources.find(resource => resource.id === booking.resourceId)?.name} · {booking.quantity} {booking.quantity === 1 ? 'място' : 'места'}</span></div>
      <div className="row-actions"><button onClick={() => onEdit(booking)} aria-label={`Промени резервацията на ${booking.customer}`}>Промени</button><button className="danger" onClick={() => onDelete(booking.id)} aria-label={`Откажи резервацията на ${booking.customer}`}>Откажи</button></div>
    </article>)}</div>}
  </section>;
}
