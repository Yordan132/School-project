import React, { useEffect, useMemo, useState } from "react";
import { businesses } from "./data/businesses.js";
import { createDemoBookings } from "./data/seed.js";
import {
  bookingKey,
  buildIndex,
  buildOccupancy,
  formatTime,
  getHours,
  getSlots,
  today,
  validateBooking,
} from "./utils/booking.js";
import { loadBookings, saveBookings } from "./utils/storage.js";
import SlotGrid from "./components/SlotGrid.jsx";
import BookingForm from "./components/BookingForm.jsx";
import BookingList from "./components/BookingList.jsx";

import ThemeToggle from "./components/ThemeToggle.jsx";

const EMPTY = [];

export default function App() {
  const [initial] = useState(loadBookings);
  const [bookings, setBookings] = useState(initial.bookings);
  const [warning, setWarning] = useState(initial.warning);
  const [businessId, setBusinessId] = useState(businesses[0].id);
  const [resourceId, setResourceId] = useState(businesses[0].resources[0].id);
  const [date, setDate] = useState(today);
  const [duration, setDuration] = useState(businesses[0].durations[0]);
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [message, setMessage] = useState("");
  const [formVersion, setFormVersion] = useState(0);

  const business = businesses.find((item) => item.id === businessId);
  const resource = business.resources.find((item) => item.id === resourceId);
  // Индексът се обновява само при промяна на резервациите.
  const index = useMemo(() => buildIndex(bookings), [bookings]);
  const relevant = index.get(bookingKey(businessId, resourceId, date)) || EMPTY;
  const occupancy = useMemo(
    () => buildOccupancy(relevant, business.step, editing?.id),
    [relevant, business.step, editing?.id],
  );
  const slots = useMemo(
    () => getSlots(business, resource, date, duration, quantity, occupancy),
    [business, resource, date, duration, quantity, occupancy],
  );
  const dayBookings = useMemo(
    () =>
      bookings
        .filter((item) => item.businessId === businessId && item.date === date)
        .sort((a, b) => a.start - b.start),
    [bookings, businessId, date],
  );
  const hours = getHours(business, date);

  useEffect(() => {
    const error = saveBookings(bookings);
    if (error) setWarning(error);
  }, [bookings]);

  function clearForm() {
    setEditing(null);
    setSelected(null);
    setMessage("");
    setFormVersion((value) => value + 1);
  }

  function changeBusiness(id) {
    const next = businesses.find((item) => item.id === id);
    setBusinessId(id);
    setResourceId(next.resources[0].id);
    setDuration(next.durations[0]);
    setQuantity(1);
    clearForm();
  }

  function save(customer) {
    const booking = {
      id: editing?.id || crypto.randomUUID(),
      businessId,
      resourceId,
      date,
      start: selected,
      end: selected + duration,
      quantity,
      customer: customer.trim(),
    };
    const error = validateBooking(booking, business, relevant);
    if (error) {
      setMessage(error);
      return;
    }
    setBookings((current) =>
      editing
        ? current.map((item) => (item.id === editing.id ? booking : item))
        : [...current, booking],
    );
    clearForm();
    setMessage(
      editing ? "Промените са запазени." : "Резервацията е създадена успешно.",
    );
  }

  function edit(booking) {
    setEditing(booking);
    setResourceId(booking.resourceId);
    setDuration(booking.end - booking.start);
    setQuantity(booking.quantity);
    setSelected(booking.start);
    setMessage(
      "Редактирате резервация. Изберете нов час или променете данните.",
    );
    document
      .getElementById("booking-area")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  function remove(id) {
    if (!window.confirm("Да отменим ли тази резервация?")) return;
    setBookings((current) => current.filter((item) => item.id !== id));
    if (editing?.id === id) clearForm();
    setMessage("Резервацията е отменена. Капацитетът е освободен.");
  }

  function reset() {
    if (
      !window.confirm(
        "Да заменим ли всички резервации с примерни данни за днешния ден?",
      )
    )
      return;
    setBookings(createDemoBookings());
    setDate(today());
    clearForm();
    setMessage("Примерните данни са възстановени.");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="logo" href="#">
          <span>м.</span> място<span className="logo-dot">®</span>
        </a>
        <p className="sidebar-caption">
          Един график.
          <br />
          Много възможности.
        </p>
        <span className="nav-label">ВАШИТЕ БИЗНЕСИ</span>
        <nav aria-label="Избор на бизнес">
          {businesses.map((item) => (
            <button
              key={item.id}
              className={`business-button ${item.id === businessId ? "active" : ""}`}
              onClick={() => changeBusiness(item.id)}
              aria-pressed={item.id === businessId}
            >
              <span className="business-icon">{item.icon}</span>
              <span>
                <strong>{item.name}</strong>
                <small>{item.type}</small>
              </span>
              <span className="nav-arrow">↗</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="live-dot" /> Демо пространство
          <p>
            Една система. Различни правила.
            <br />
            Настройва се според бизнеса.
          </p>
          <button onClick={reset}>↻ Възстанови примерните данни</button>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <span>
            Работно пространство <span className="slash">/</span>{" "}
            <strong>Резервации</strong>
          </span>
          <div className="header-actions">
            <ThemeToggle />
            <span className="avatar">Й</span>
          </div>
        </header>
        <div className="page-content">
          <div className="intro">
            <div>
              <span className="eyebrow">ПЛАНИРАЙТЕ С ЛЕКОТА</span>
              <h1>
                Всяко нещо
                <br />
                на своето <em>място.</em>
              </h1>
              <p>Изберете време. Ние ще проверим наличността.</p>
            </div>
            <div className="business-card">
              <span className="business-icon large">{business.icon}</span>
              <span className="eyebrow">{business.type}</span>
              <h2>{business.name}</h2>
              <p>{business.description}</p>
              <span className="badge">
                {business.resources.length} ресурса · общ модел
              </span>
            </div>
          </div>
          <div className="stats">
            <div>
              <span>Резервации за деня</span>
              <strong>{dayBookings.length.toString().padStart(2, "0")}</strong>
            </div>
            <div>
              <span>Свободни начални часове*</span>
              <strong>
                {slots
                  .filter((slot) => slot.available)
                  .length.toString()
                  .padStart(2, "0")}
              </strong>
            </div>
            <div>
              <span>Капацитет на ресурса</span>
              <strong>
                {resource.capacity.toString().padStart(2, "0")}{" "}
                <small>{resource.capacity === 1 ? "място" : "места"}</small>
              </strong>
            </div>
          </div>
          {warning && (
            <p className="notice warning" role="alert">
              {warning}
            </p>
          )}
          <p className="notice" role="status" aria-live="polite">
            {message || "Изберете удобен час от графика по-долу."}
          </p>
          <div className="booking-layout" id="booking-area">
            <section className="panel availability">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">НАМЕРЕТЕ ВАШЕТО ВРЕМЕ</span>
                  <h2>Наличност</h2>
                </div>
                <span className="step">01</span>
              </div>
              <div className="filters">
                <label>
                  Дата
                  <input
                    type="date"
                    value={date}
                    required
                    onChange={(event) => {
                      setDate(event.target.value);
                      setSelected(null);
                    }}
                  />
                </label>
                <label>
                  {business.resourceLabel}
                  <select
                    value={resourceId}
                    onChange={(event) => {
                      setResourceId(event.target.value);
                      setQuantity(1);
                      setSelected(null);
                    }}
                  >
                    {business.resources.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Продължителност
                  <select
                    value={duration}
                    onChange={(event) => {
                      setDuration(Number(event.target.value));
                      setSelected(null);
                    }}
                  >
                    {business.durations.map((value) => (
                      <option key={value} value={value}>
                        {value} минути
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Брой места
                  <input
                    type="number"
                    min="1"
                    max={resource.capacity}
                    value={quantity}
                    onChange={(event) => {
                      setQuantity(Number(event.target.value));
                      setSelected(null);
                    }}
                  />
                </label>
              </div>
              <div className="slot-toolbar">
                <span>
                  {hours.length
                    ? hours
                        .map(
                          ([open, close]) =>
                            `${formatTime(open)}–${formatTime(close)}`,
                        )
                        .join(" / ")
                    : "Почивен ден"}
                </span>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={onlyAvailable}
                    onChange={(event) => setOnlyAvailable(event.target.checked)}
                  />
                  Само свободни
                </label>
              </div>
              <SlotGrid
                slots={slots}
                selected={selected}
                onSelect={setSelected}
                onlyAvailable={onlyAvailable}
              />
              <p className="small muted">
                * За избрания ресурс, продължителност и брой места. Часовете са
                възможни начала на резервация.
              </p>
            </section>
            <section className="panel form-panel">
              <BookingForm
                key={`${editing?.id || "new"}-${formVersion}`}
                editing={editing}
                selected={selected}
                duration={duration}
                quantity={quantity}
                resource={resource}
                onSave={save}
                onCancel={clearForm}
              />
            </section>
          </div>
          <BookingList
            bookings={dayBookings}
            business={business}
            onEdit={edit}
            onDelete={remove}
          />
          <footer>
            <span>място · Универсална система за резервации</span>
            <span>Учебен проект / React + Vite</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
