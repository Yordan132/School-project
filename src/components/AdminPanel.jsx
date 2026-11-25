import React, { useMemo, useState } from "react";
import { customers } from "../data/profiles.js";
import { businesses } from "../data/businesses.js";
import BookingList from "./BookingList.jsx";

// Set премахва повтарящите се видове услуги от менюто.
const serviceTypes = [...new Set(businesses.map((business) => business.type))];

export default function AdminPanel({ bookings, onEdit, onDelete, onReset }) {
  const [customerId, setCustomerId] = useState("all");
  const [serviceType, setServiceType] = useState("all");
  const [date, setDate] = useState("");
  const counts = useMemo(() => {
    const result = new Map();
    for (const booking of bookings)
      result.set(booking.customerId, (result.get(booking.customerId) || 0) + 1);
    return result;
  }, [bookings]);
  // Всяка проверка отговаря на един филтър от екрана.
  const filtered = bookings.filter((booking) => {
    if (customerId !== "all" && booking.customerId !== customerId) return false;
    const business = businesses.find((item) => item.id === booking.businessId);
    if (serviceType !== "all" && business.type !== serviceType) return false;
    if (!date) return true;
    if (booking.endDate) return booking.date <= date && date < booking.endDate;
    return booking.date === date;
  });
  return (
    <>
      <section className="panel admin-filters">
        <div className="filters">
          <label>
            Клиент
            <select
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
            >
              <option value="all">Всички клиенти</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Вид услуга
            <select
              value={serviceType}
              onChange={(event) => setServiceType(event.target.value)}
            >
              <option value="all">Всички видове услуги</option>
              {serviceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label>
            Дата / нощувка
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
          <button
            className="text-button"
            onClick={() => {
              setCustomerId("all");
              setServiceType("all");
              setDate("");
            }}
          >
            Изчисти филтрите
          </button>
        </div>
      </section>
      <BookingList
        bookings={filtered}
        title="Всички резервации"
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <section className="panel customer-section">
        <div className="section-heading">
          <div>
            <h2>Всички клиенти</h2>
          </div>
          <span className="count">{customers.length}</span>
        </div>
        <div className="customer-cards">
          {customers.map((customer) => (
            <article className="customer-card" key={customer.id}>
              <strong>{customer.name}</strong>
              <span>{customer.email}</span>
              <small>{counts.get(customer.id) || 0} резервации</small>
            </article>
          ))}
        </div>
      </section>
      <button className="text-button" onClick={onReset}>
        Възстанови примерните данни
      </button>
    </>
  );
}
