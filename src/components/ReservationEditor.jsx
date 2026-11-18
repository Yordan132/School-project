import React, { useMemo, useState } from "react";
import {
  bookingKey,
  buildOccupancy,
  getHours,
  getSlots,
  formatTime,
  today,
} from "../utils/booking.js";
import { addDays, nightCount } from "../utils/dates.js";
import { hotelAvailability } from "../utils/hotels.js";
import SlotGrid from "./SlotGrid.jsx";
import BookingForm from "./BookingForm.jsx";
const EMPTY = [];

export default function ReservationEditor({
  business,
  profile,
  index,
  editing,
  onSave,
  onCancel,
}) {
  const isHotel = business.mode === "nights";
  const [resourceId, setResourceId] = useState(
    editing?.resourceId || business.resources[0].id,
  );
  const [date, setDate] = useState(editing?.date || today());
  const [endDate, setEndDate] = useState(
    editing?.endDate || addDays(today(), 1),
  );
  const [duration, setDuration] = useState(
    editing && !isHotel
      ? editing.end - editing.start
      : business.durations?.[0] || 0,
  );
  const [quantity, setQuantity] = useState(editing?.quantity || 1);
  const [selected, setSelected] = useState(editing?.start ?? null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const resource = business.resources.find((item) => item.id === resourceId);
  const relevant =
    index.get(bookingKey(business.id, resourceId, isHotel ? "*" : date)) ||
    EMPTY;
  const occupancy = useMemo(
    () => (isHotel ? [] : buildOccupancy(relevant, business.step, editing?.id)),
    [relevant, business.step, editing?.id, isHotel],
  );
  const slots = useMemo(
    () =>
      isHotel
        ? []
        : getSlots(business, resource, date, duration, quantity, occupancy),
    [business, resource, date, duration, quantity, occupancy, isHotel],
  );
  const remaining = useMemo(
    () =>
      isHotel
        ? hotelAvailability(resource, date, endDate, relevant, editing?.id)
        : 0,
    [isHotel, resource, date, endDate, relevant, editing?.id],
  );
  const nights = nightCount(date, endDate);
  const validQuantity =
    Number.isInteger(quantity) &&
    quantity >= 1 &&
    quantity <= resource.capacity;
  const available =
    validQuantity &&
    (isHotel
      ? nights >= 1 && nights <= 30 && remaining >= quantity
      : slots.some((slot) => slot.start === selected && slot.available));
  const hours = isHotel ? [] : getHours(business, date);

  function save() {
    const common = {
      id: editing?.id || crypto.randomUUID(),
      businessId: business.id,
      resourceId,
      date,
      quantity,
    };
    onSave(
      isHotel
        ? { ...common, endDate }
        : { ...common, start: selected, end: selected + duration },
    );
  }
  return (
    <div id="booking-area">
      <div
        className="resource-cards"
        aria-label={`Избор: ${business.resourceLabel}`}
      >
        {business.resources.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={item.id === resourceId}
            className={`resource-card ${item.id === resourceId ? "chosen" : ""}`}
            onClick={() => {
              setResourceId(item.id);
              setSelected(null);
              setQuantity(1);
            }}
          >
            <span>{business.icon}</span>
            <strong>{item.name}</strong>
            <small>{item.detail}</small>
            {isHotel && <small>{item.capacity} стаи общо</small>}
          </button>
        ))}
      </div>
      <div className="booking-layout">
        <section className="panel availability">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                {isHotel ? "ПЛАНИРАЙТЕ ВАШИЯ ПРЕСТОЙ" : "НАМЕРЕТЕ ВАШЕТО ВРЕМЕ"}
              </span>
              <h2>{isHotel ? "Наличност на стаи" : "Свободни часове"}</h2>
            </div>
            <span className="step">01</span>
          </div>
          <div className="filters">
            <label>
              {isHotel ? "Настаняване" : "Дата"}
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
            {isHotel ? (
              <label>
                Напускане
                <input
                  type="date"
                  value={endDate}
                  min={addDays(date, 1)}
                  max={addDays(date, 30)}
                  required
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </label>
            ) : (
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
            )}
            {isHotel && (
              <label>
                Брой стаи
                <input
                  type="number"
                  min="1"
                  max={resource.capacity}
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                />
              </label>
            )}
          </div>
          {isHotel ? (
            <div className="hotel-availability">
              <strong>{nights >= 1 && nights <= 30 ? remaining : "—"}</strong>
              <span>свободни стаи за целия престой</span>
              <p className="muted">
                {nights >= 1 && nights <= 30
                  ? `${nights} нощувки · Напускане до 11:00, настаняване след 14:00.`
                  : "Изберете период от 1 до 30 нощувки."}
              </p>
              {validQuantity &&
                nights >= 1 &&
                nights <= 30 &&
                remaining < quantity && (
                  <p className="notice warning">
                    Няма достатъчно стаи за избрания период.
                  </p>
                )}
            </div>
          ) : (
            <>
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
                Заетостта включва всички клиенти. Чуждите лични данни не се
                показват.
              </p>
            </>
          )}
        </section>
        <section className="panel form-panel">
          <BookingForm
            editing={editing}
            selected={selected}
            duration={duration}
            quantity={quantity}
            resource={resource}
            date={date}
            endDate={endDate}
            isHotel={isHotel}
            customer={editing?.customer || profile.name}
            available={available}
            onSave={save}
            onCancel={onCancel}
          />
        </section>
      </div>
    </div>
  );
}
