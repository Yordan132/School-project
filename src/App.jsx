import React, { useEffect, useMemo, useState } from "react";
import { businesses } from "./data/businesses.js";
import { profiles, customers } from "./data/profiles.js";
import { createDemoBookings } from "./data/seed.js";
import { buildIndex } from "./utils/booking.js";
import {
  canManageBooking,
  visibleBookings,
  saveReservation,
  cancelReservation,
} from "./utils/access.js";
import { loadBookings, saveBookings } from "./utils/storage.js";
import ThemeToggle from "./components/ThemeToggle.jsx";
import ReservationEditor from "./components/ReservationEditor.jsx";
import BookingList from "./components/BookingList.jsx";
import AdminPanel from "./components/AdminPanel.jsx";

function initialProfile() {
  try {
    const savedId = localStorage.getItem("myasto-profile");
    const exists = profiles.some((profile) => profile.id === savedId);
    return exists ? savedId : customers[0].id;
  } catch {
    return customers[0].id;
  }
}

export default function App() {
  const [initial] = useState(loadBookings);
  const [bookings, setBookings] = useState(initial.bookings);
  const [warning, setWarning] = useState(initial.warning);
  const [storageBlocked, setStorageBlocked] = useState(
    Boolean(initial.storageBlocked),
  );
  const [profileId, setProfileId] = useState(initialProfile);
  const [businessId, setBusinessId] = useState(businesses[0].id);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [editorVersion, setEditorVersion] = useState(0);
  const profile = profiles.find((item) => item.id === profileId);
  const isAdmin = profile.role === "admin";
  const business = businesses.find((item) => item.id === businessId);
  // Състояние -> изчислени данни -> действия -> HTML на екрана.
  let pageTitle = "Запазете час";
  if (business.mode === "nights") pageTitle = "Резервирайте престой";
  if (isAdmin) pageTitle = "Управление на резервации";
  const index = useMemo(() => buildIndex(bookings), [bookings]);
  const visible = useMemo(
    () =>
      visibleBookings(bookings, profile).sort(
        (a, b) =>
          a.date.localeCompare(b.date) || (a.start || 0) - (b.start || 0),
      ),
    [bookings, profile],
  );

  useEffect(() => {
    // При грешка в зареждането пазим оригинала, докато потребителят избере reset.
    if (storageBlocked) return;
    const error = saveBookings(bookings);
    if (error) setWarning(error);
  }, [bookings, storageBlocked]);
  useEffect(() => {
    try {
      localStorage.setItem("myasto-profile", profileId);
    } catch {
      /* Демо профилът работи и без запис. */
    }
  }, [profileId]);

  function clearEditor() {
    setEditing(null);
    // Новият key създава чиста форма след запис или смяна на профил/отдел.
    setEditorVersion((value) => value + 1);
  }
  function changeProfile(id) {
    setProfileId(id);
    clearEditor();
    setMessage("");
  }
  function changeDepartment(id) {
    setBusinessId(id);
    clearEditor();
    setMessage("");
  }
  function save(draft) {
    if (storageBlocked) return;
    // Проверката използва всички резервации, включително невидимите чужди часове.
    const result = saveReservation(bookings, draft, business, profile);
    if (result.error) {
      setMessage(result.error);
      return;
    }
    setBookings(result.bookings);
    setMessage(
      editing ? "Промените са запазени." : "Резервацията е създадена успешно.",
    );
    clearEditor();
  }
  function edit(booking) {
    if (!canManageBooking(profile, booking)) {
      setMessage("Нямате право да променяте тази резервация.");
      return;
    }
    setBusinessId(booking.businessId);
    setEditing(booking);
    setMessage("Редактирате резервация.");
    setEditorVersion((value) => value + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function remove(id) {
    if (storageBlocked) return;
    const result = cancelReservation(bookings, id, profile);
    if (result.error) {
      setMessage(result.error);
      return;
    }
    if (!window.confirm("Да отменим ли тази резервация?")) return;
    setBookings(result.bookings);
    if (editing?.id === id) clearEditor();
    setMessage("Резервацията е отменена.");
  }
  function reset() {
    if (
      !isAdmin ||
      !window.confirm(
        "Да заменим ли всички резервации с примерни данни за днешния ден?",
      )
    )
      return;
    setStorageBlocked(false);
    setWarning("");
    setBookings(createDemoBookings());
    clearEditor();
    setMessage("Примерните данни са възстановени.");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="logo" href="#">
          OnePlace
          <span className="brand-dot" />
        </a>
        <nav aria-label="Избор на отдел">
          {businesses.map((item) => (
            <button
              key={item.id}
              className={`business-button ${item.id === businessId ? "active" : ""}`}
              aria-pressed={item.id === businessId}
              onClick={() => changeDepartment(item.id)}
            >
              <span className="nav-dot" aria-hidden="true" />
              <span>
                <strong>{item.name}</strong>
                <small>{item.type}</small>
              </span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="live-dot" /> Демо пространство
          <p>
            Един график.
            <br />
            Много възможности.
          </p>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <span className="panel-label">
            {isAdmin ? "Администраторски панел" : "Клиентски панел"}
          </span>
          <div className="header-actions">
            <label className="profile-select">
              Демо профил
              <select
                aria-label="Активен профил"
                value={profileId}
                onChange={(event) => changeProfile(event.target.value)}
              >
                {profiles.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                    {item.role === "admin" ? " · Admin" : " · Клиент"}
                  </option>
                ))}
              </select>
            </label>
            <ThemeToggle />
          </div>
        </header>
        <div className="page-content">
          <div className="page-heading">
            <div>
              <h1>{pageTitle}</h1>
              <p>
                {isAdmin
                  ? `${customers.length} клиенти · ${visible.length} резервации във всички отдели`
                  : business.description}
              </p>
            </div>
            {!isAdmin && (
              <span className="personal-count">
                {visible.length} мои резервации
              </span>
            )}
          </div>
          {warning && (
            <p className="notice warning" role="alert">
              {warning}
            </p>
          )}
          <p
            className={`notice ${message ? "has-message" : ""}`}
            role="status"
            aria-live="polite"
          >
            {message}
          </p>
          {(!isAdmin || editing) && (
            <ReservationEditor
              key={editorVersion}
              business={business}
              profile={profile}
              index={index}
              editing={editing}
              storageBlocked={storageBlocked}
              onSave={save}
              onCancel={clearEditor}
            />
          )}
          {isAdmin ? (
            <AdminPanel
              bookings={visible}
              onEdit={edit}
              onDelete={remove}
              onReset={reset}
            />
          ) : (
            <BookingList bookings={visible} onEdit={edit} onDelete={remove} />
          )}
          <footer>
            <span>OnePlace · Универсална система за резервации</span>
            <span>Демо профили · без защитен вход</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
