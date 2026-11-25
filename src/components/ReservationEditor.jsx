import React, { useCallback, useMemo, useState } from "react";
import { formatTime } from "../utils/booking.js";
import { addDays, displayDate } from "../utils/dates.js";
import { createBookingId } from "../utils/ids.js";
import { createForm, getAvailability } from "../utils/editor.js";
import SlotGrid from "./SlotGrid.jsx";
import BookingForm from "./BookingForm.jsx";

export default function ReservationEditor({
  business,
  profile,
  index,
  editing,
  storageBlocked,
  onSave,
  onCancel,
}) {
  const isHotel = business.mode === "nights";
  const [form, setForm] = useState(() => createForm(business, editing));
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const {
    resourceId,
    roomTypeId,
    date,
    endDate,
    duration,
    quantity,
    selected,
  } = form;

  // Преизчисляваме само когато формата, резервациите или отделът се променят.
  const options = useMemo(
    () => getAvailability(business, form, index, editing),
    [business, form, index, editing],
  );
  const {
    resource,
    roomType,
    roomTypes,
    slots,
    hours,
    remaining,
    nights,
    validPeriod,
    available,
    suggestions,
  } = options;

  function updateForm(changes) {
    setForm((current) => ({ ...current, ...changes }));
  }
  // Стабилната функция позволява на SlotGrid да пропуска излишни рендери.
  const selectTime = useCallback((selected) => {
    setForm((current) => ({ ...current, selected }));
  }, []);

  function save() {
    const booking = {
      id: editing?.id || createBookingId(),
      businessId: business.id,
      resourceId,
      date,
      quantity,
    };
    if (isHotel) {
      booking.endDate = endDate;
      if (roomTypeId) booking.roomType = roomTypeId;
    } else {
      booking.start = selected;
      booking.end = selected + duration;
    }
    onSave(booking);
  }

  function applySuggestion(suggestion) {
    if (isHotel) {
      updateForm({
        resourceId: suggestion.resourceId,
        roomTypeId: suggestion.roomTypeId,
        date: suggestion.date,
        endDate: suggestion.endDate,
      });
    } else {
      updateForm({ date: suggestion.date, selected: suggestion.start });
    }
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
                  updateForm({
                    resourceId: item.id,
                    roomTypeId: item.roomTypes?.[0]?.id || "",
                    selected: null,
                    quantity: 1,
                  });
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
                  updateForm({ date: event.target.value, selected: null });
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
                  onChange={(event) =>
                    updateForm({ endDate: event.target.value })
                  }
                />
              </label>
            ) : (
              <label>
                Продължителност
                <select
                  value={duration}
                  onChange={(event) => {
                    updateForm({
                      duration: Number(event.target.value),
                      selected: null,
                    });
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
                      updateForm({
                        roomTypeId: event.target.value,
                        quantity: 1,
                      });
                    }}
                  >
                    {roomTypes.map((item) => (
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
                      updateForm({ quantity: Number(event.target.value) })
                    }
                  />
                </label>
              </>
            )}
          </div>
          {isHotel ? (
            <div className="hotel-availability">
              <strong>{validPeriod ? remaining : "—"}</strong>
              <span>
                {roomTypeId
                  ? "свободни стаи от този вид за целия престой"
                  : "свободни стаи общо за целия престой"}
              </span>
              <p className="muted">
                {validPeriod
                  ? `${nights} нощувки · Напускане до 11:00, настаняване след 14:00.`
                  : "Изберете период от 1 до 30 нощувки."}
              </p>
              {validPeriod && remaining < quantity && (
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
                onSelect={selectTime}
                onlyAvailable={onlyAvailable}
              />
              <p className="small muted">
                Заетостта включва всички клиенти. Чуждите лични данни не се
                показват.
              </p>
            </>
          )}
          {suggestions.length > 0 && (
            <section
              className="suggestions"
              aria-label={
                isHotel ? "Алтернативни престои" : "Предложени часове"
              }
            >
              <h3>
                {isHotel ? "Предложени варианти" : "Следващи свободни часове"}
              </h3>
              <p>
                {isHotel
                  ? "Пробвайте друг тип стая, хотел или близка дата."
                  : "Изберете удобна алтернатива за този специалист."}
              </p>
              <div className="suggestion-list">
                {suggestions.map((suggestion, position) => (
                  <button
                    className="suggestion-option"
                    key={position}
                    type="button"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    <strong>
                      {isHotel
                        ? `${suggestion.resourceName} · ${suggestion.roomTypeName}`
                        : `${displayDate(suggestion.date)} · ${formatTime(suggestion.start)}`}
                    </strong>
                    <small>
                      {isHotel
                        ? `${displayDate(suggestion.date)} – ${displayDate(suggestion.endDate)} · ${suggestion.remaining} свободни`
                        : `${resource.name} · ${duration} минути`}
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
            available={available && !storageBlocked}
            onSave={save}
            onCancel={onCancel}
          />
        </section>
      </div>
    </div>
  );
}
