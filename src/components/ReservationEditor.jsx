import React, { useMemo, useState } from "react";
import {
  bookingKey,
  buildOccupancy,
  getHours,
  getSlots,
  formatTime,
  today,
} from "../utils/booking.js";
import { addDays, displayDate, nightCount } from "../utils/dates.js";
import { hotelAvailability } from "../utils/hotels.js";
import {
  suggestHotelAlternatives,
  suggestTimeAlternatives,
} from "../utils/suggestions.js";
import { createBookingId } from "../utils/ids.js";
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
  const [roomTypeId, setRoomTypeId] = useState(
    editing?.roomType || business.resources[0].roomTypes?.[0]?.id || "",
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
  const roomType = isHotel
    ? resource.roomTypes.find((item) => item.id === roomTypeId)
    : null;
  const relevant =
    index.get(bookingKey(business.id, resourceId, isHotel ? "*" : date)) ||
    EMPTY;
  const hotelBookings = useMemo(
    () =>
      isHotel
        ? business.resources.flatMap(
            (item) => index.get(bookingKey(business.id, item.id, "*")) || EMPTY,
          )
        : EMPTY,
    [isHotel, business, index],
  );
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
        ? hotelAvailability(
            resource,
            date,
            endDate,
            relevant,
            editing?.id,
            roomTypeId,
          )
        : 0,
    [isHotel, resource, date, endDate, relevant, editing?.id, roomTypeId],
  );
  const nights = nightCount(date, endDate);
  const validQuantity =
    Number.isInteger(quantity) &&
    quantity >= 1 &&
    quantity <= (isHotel ? roomType?.capacity || 0 : resource.capacity);
  const available =
    validQuantity &&
    (isHotel
      ? nights >= 1 && nights <= 30 && remaining >= quantity
      : slots.some((slot) => slot.start === selected && slot.available));
  const hours = isHotel ? [] : getHours(business, date);
  const suggestionAnchor =
    selected ?? slots.find((slot) => !slot.available)?.start ?? null;
  const needsTimeSuggestions =
    !isHotel &&
    !slots.some((slot) => slot.start === selected && slot.available) &&
    (slots.length === 0 || slots.some((slot) => !slot.available));
  const timeSuggestions = useMemo(
    () =>
      needsTimeSuggestions
        ? suggestTimeAlternatives({
            business,
            resource,
            date,
            duration,
            quantity,
            index,
            selected: suggestionAnchor,
            ignoredId: editing?.id,
          })
        : EMPTY,
    [
      needsTimeSuggestions,
      business,
      resource,
      date,
      duration,
      quantity,
      index,
      selected,
      suggestionAnchor,
      editing?.id,
    ],
  );
  const hotelSuggestions = useMemo(
    () =>
      isHotel && nights >= 1 && nights <= 30 && remaining < quantity
        ? suggestHotelAlternatives({
            business,
            resourceId,
            roomTypeId,
            date,
            endDate,
            quantity,
            bookings: hotelBookings,
            ignoredId: editing?.id,
          })
        : EMPTY,
    [
      isHotel,
      nights,
      remaining,
      quantity,
      business,
      resourceId,
      roomTypeId,
      date,
      endDate,
      hotelBookings,
      editing?.id,
    ],
  );

  function save() {
    const common = {
      id: editing?.id || createBookingId(),
      businessId: business.id,
      resourceId,
      date,
      quantity,
    };
    onSave(
      isHotel
        ? { ...common, endDate, roomType: roomTypeId }
        : { ...common, start: selected, end: selected + duration },
    );
  }
  function applyTimeSuggestion(suggestion) {
    setDate(suggestion.date);
    setSelected(suggestion.start);
  }
  function applyHotelSuggestion(suggestion) {
    setResourceId(suggestion.resourceId);
    setRoomTypeId(suggestion.roomTypeId);
    setDate(suggestion.date);
    setEndDate(suggestion.endDate);
  }
  return (
    <div id="booking-area">
      <div className="booking-layout">
        <section className="panel availability">
          <div className="section-heading">
            <h2>{isHotel ? "Изберете хотел" : "Изберете специалист"}</h2>
          </div>
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
                  if (isHotel) setRoomTypeId(item.roomTypes[0].id);
                  setSelected(null);
                  setQuantity(1);
                }}
              >
                <span className="selection-dot" aria-hidden="true" />
                <span className="resource-description">
                  <strong>{item.name}</strong>
                  <small>{item.detail}</small>
                </span>
                {isHotel && <small>{item.capacity} стаи общо</small>}
              </button>
            ))}
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
              <>
                <label>
                  Вид на стаята
                  <select
                    value={roomTypeId}
                    onChange={(event) => {
                      setRoomTypeId(event.target.value);
                      setQuantity(1);
                    }}
                  >
                    {resource.roomTypes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.capacity} общо)
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Брой стаи
                  <input
                    type="number"
                    min="1"
                    max={roomType?.capacity}
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(Number(event.target.value))
                    }
                  />
                </label>
              </>
            )}
          </div>
          {isHotel ? (
            <div className="hotel-availability">
              <strong>{nights >= 1 && nights <= 30 ? remaining : "—"}</strong>
              <span>свободни стаи от този вид за целия престой</span>
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
                    Няма достатъчно стаи от този вид за избрания период.
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
          {hotelSuggestions.length > 0 && (
            <section className="suggestions" aria-label="Алтернативни престои">
              <h3>Предложени варианти</h3>
              <p>Пробвайте друг тип стая, хотел или близка дата.</p>
              <div className="suggestion-list">
                {hotelSuggestions.map((suggestion) => (
                  <button
                    className="suggestion-option"
                    key={`${suggestion.resourceId}:${suggestion.roomTypeId}:${suggestion.date}`}
                    type="button"
                    onClick={() => applyHotelSuggestion(suggestion)}
                  >
                    <strong>
                      {suggestion.resourceName} · {suggestion.roomTypeName}
                    </strong>
                    <small>
                      {displayDate(suggestion.date)} –{" "}
                      {displayDate(suggestion.endDate)} · {suggestion.remaining}{" "}
                      свободни
                    </small>
                  </button>
                ))}
              </div>
            </section>
          )}
          {timeSuggestions.length > 0 && (
            <section className="suggestions" aria-label="Предложени часове">
              <h3>Следващи свободни часове</h3>
              <p>Изберете удобна алтернатива за този специалист.</p>
              <div className="suggestion-list">
                {timeSuggestions.map((suggestion) => (
                  <button
                    className="suggestion-option"
                    key={`${suggestion.date}:${suggestion.start}`}
                    type="button"
                    onClick={() => applyTimeSuggestion(suggestion)}
                  >
                    <strong>
                      {displayDate(suggestion.date)} ·{" "}
                      {formatTime(suggestion.start)}
                    </strong>
                    <small>
                      {resource.name} · {duration} минути
                    </small>
                  </button>
                ))}
              </div>
            </section>
          )}
        </section>
        <section className="panel form-panel">
          <BookingForm
            editing={editing}
            selected={selected}
            duration={duration}
            quantity={quantity}
            resource={resource}
            roomType={roomType}
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
