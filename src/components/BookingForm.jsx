import React, { useState } from "react";
import { formatTime } from "../utils/booking.js";

export default function BookingForm({
  editing,
  selected,
  duration,
  quantity,
  resource,
  onSave,
  onCancel,
}) {
  const [customer, setCustomer] = useState(editing?.customer || "");
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave(customer);
      }}
    >
      <div className="section-heading">
        <h2>{editing ? "Промяна на резервация" : "Вашата резервация"}</h2>
        <span className="step">02</span>
      </div>
      <p className="muted">{resource.name}</p>
      <div className="booking-summary">
        <span>Избран час</span>
        <strong>
          {selected === null
            ? "Изберете от графика"
            : `${formatTime(selected)} – ${formatTime(selected + duration)}`}
        </strong>
      </div>
      <label>
        Име на клиента
        <input
          required
          maxLength={80}
          value={customer}
          onChange={(event) => setCustomer(event.target.value)}
          placeholder="Например: Иван Петров"
          autoComplete="name"
        />
      </label>
      <p className="muted">
        {duration} минути · {quantity} {quantity === 1 ? "място" : "места"}
      </p>
      <button className="primary" disabled={selected === null} type="submit">
        {editing ? "Запази промените" : "Потвърди резервация"} <span>↗</span>
      </button>
      {editing && (
        <button className="text-button" type="button" onClick={onCancel}>
          Откажи редакцията
        </button>
      )}
      <p className="small muted">
        Демонстрационна система. Резервациите се пазят в този браузър.
      </p>
    </form>
  );
}
