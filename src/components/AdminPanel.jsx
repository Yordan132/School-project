import React, { useMemo, useState } from "react";
import { customers } from "../data/profiles.js";
import { businesses } from "../data/businesses.js";
import BookingList from "./BookingList.jsx";

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
  const filtered = bookings.filter(
    (item) =>
      (customerId === "all" || item.customerId === customerId) &&
      (serviceType === "all" ||
        businesses.find((business) => business.id === item.businessId)
          ?.type === serviceType) &&
      (!date ||
        (item.endDate
          ? item.date <= date && item.endDate > date
          : item.date === date)),
  );
  return (
    <>
      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">КЛИЕНТСКА БАЗА</span>
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
              {[...new Set(businesses.map((business) => business.type))].map(
                (type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ),
              )}
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
      <button className="text-button" onClick={onReset}>
        Възстанови примерните данни
      </button>
    </>
  );
}
