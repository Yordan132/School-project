import React from "react";
import { formatTime } from "../utils/booking.js";
import { displayDate, nightCount } from "../utils/dates.js";

export default function BookingForm({
  editing,
  selected,
  duration,
  quantity,
  resource,
  date,
  endDate,
  isHotel,
  customer,
  available,
  onSave,
  onCancel,
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <div className="section-heading">
        <h2>{editing ? "Промяна на резервация" : "Вашата резервация"}</h2>
        <span className="step">02</span>
      </div>
      <p className="muted">{resource.name}</p>
      <div className="booking-summary">
        <span>{isHotel ? "Период на престоя" : "Избран час"}</span>
        <strong>
          {isHotel
            ? `${displayDate(date)} – ${displayDate(endDate)}`
            : selected === null
              ? "Изберете от графика"
              : `${formatTime(selected)} – ${formatTime(selected + duration)}`}
        </strong>
      </div>
      <label>
        Клиент
        <input value={customer} readOnly />
      </label>
      <p className="muted">
        {isHotel
          ? `${nightCount(date, endDate)} нощувки · ${quantity} стаи`
          : `${duration} минути · ${quantity} място`}
      </p>
      <button className="primary" disabled={!available} type="submit">
        {editing ? "Запази промените" : "Потвърди резервация"} <span>→</span>
      </button>
      {editing && (
        <button className="text-button" type="button" onClick={onCancel}>
          Откажи редакцията
        </button>
      )}
      <p className="small muted">
        Резервацията е свързана с клиентския профил.
      </p>
    </form>
  );
}
