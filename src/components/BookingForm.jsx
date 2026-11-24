import React from "react";
import { formatTime } from "../utils/booking.js";
import { displayDate, nightCount } from "../utils/dates.js";

export default function BookingForm({
  editing,
  selected,
  duration,
  quantity,
  resource,
  roomType,
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
      </div>
      <dl className="summary-details">
        <div>
          <dt>Клиент</dt>
          <dd>{customer}</dd>
        </div>
        <div>
          <dt>{isHotel ? "Хотел" : "Специалист"}</dt>
          <dd>{resource.name}</dd>
        </div>
        {isHotel && (
          <div>
            <dt>Вид стая</dt>
            <dd>{roomType.name}</dd>
          </div>
        )}
        <div>
          <dt>{isHotel ? "Настаняване" : "Дата"}</dt>
          <dd>{displayDate(date)}</dd>
        </div>
        {isHotel && (
          <div>
            <dt>Напускане</dt>
            <dd>{displayDate(endDate)}</dd>
          </div>
        )}
      </dl>
      <div className="booking-summary">
        <span>{isHotel ? "Вашият престой" : "Избран час"}</span>
        <strong>
          {isHotel
            ? `${nightCount(date, endDate)} нощувки · ${quantity} стаи`
            : selected === null
              ? "Изберете от графика"
              : `${formatTime(selected)} – ${formatTime(selected + duration)}`}
        </strong>
        {!isHotel && <span>{duration} минути</span>}
      </div>
      <button className="primary" disabled={!available} type="submit">
        {editing ? "Запази промените" : "Потвърди резервация"}
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
