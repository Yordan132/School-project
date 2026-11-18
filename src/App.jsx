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
    return (
      profiles.find(
        (profile) => profile.id === localStorage.getItem("myasto-profile"),
      )?.id || customers[0].id
    );
  } catch {
    return customers[0].id;
  }
}

export default function App() {
  const [initial] = useState(loadBookings);
  const [bookings, setBookings] = useState(initial.bookings);
  const [warning, setWarning] = useState(initial.warning);
  const [profileId, setProfileId] = useState(initialProfile);
  const [businessId, setBusinessId] = useState(businesses[0].id);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [formVersion, setFormVersion] = useState(0);
  const profile = profiles.find((item) => item.id === profileId);
  const isAdmin = profile.role === "admin";
  const business = businesses.find((item) => item.id === businessId);
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
    const error = saveBookings(bookings);
    if (error) setWarning(error);
  }, [bookings]);
  useEffect(() => {
    try {
      localStorage.setItem("myasto-profile", profileId);
    } catch {
      /* Демо профилът работи и без запис. */
    }
  }, [profileId]);

  function clearEditor() {
    setEditing(null);
    setFormVersion((value) => value + 1);
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
    setFormVersion((value) => value + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function remove(id) {
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
    setBookings(createDemoBookings());
    clearEditor();
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
        <span className="nav-label">ОТДЕЛИ</span>
        <nav aria-label="Избор на отдел">
          {businesses.map((item) => (
            <button
              key={item.id}
              className={`business-button ${item.id === businessId ? "active" : ""}`}
              aria-pressed={item.id === businessId}
              onClick={() => changeDepartment(item.id)}
            >
              <span className="business-icon">{item.icon}</span>
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
            Три отдела.
            <br />
            Личен профил и обща наличност.
          </p>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <strong>
            {isAdmin ? "Администраторски панел" : "Клиентски панел"}
          </strong>
          <div className="header-actions">
            <ThemeToggle />
            <span className="avatar">{profile.name[0]}</span>
          </div>
        </header>
        <div className="page-content">
          <section className="profile-bar" aria-label="Демо профили">
            <div>
              <span className="eyebrow">ДЕМО ПРОФИЛ</span>
              <strong>{profile.name}</strong>
              <span className="small muted">
                Примерни профили за учебна демонстрация, без защитен вход.
              </span>
            </div>
            <label>
              Активен профил
              <select
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
          </section>
          <div className="intro">
            <div>
              <span className="eyebrow">
                {isAdmin
                  ? "УПРАВЛЕНИЕ НА РЕЗЕРВАЦИИ"
                  : "ВАШЕТО ВРЕМЕ. ВАШИЯТ ИЗБОР."}
              </span>
              <h1>
                {isAdmin ? (
                  <>
                    Всички клиенти.
                    <br />
                    Едно <em>място.</em>
                  </>
                ) : (
                  <>
                    Запазете своето
                    <br />
                    <em>място.</em>
                  </>
                )}
              </h1>
              <p>
                {isAdmin
                  ? "Преглед и управление на резервациите във всички отдели."
                  : business.description}
              </p>
            </div>
            <div className="business-card">
              <span className="business-icon large">{business.icon}</span>
              <span className="eyebrow">{business.type}</span>
              <h2>{business.name}</h2>
              <p>{business.description}</p>
              <span className="badge">
                3 избора ·{" "}
                {business.mode === "nights"
                  ? "Резервации по нощувки"
                  : "Резервации по часове"}
              </span>
            </div>
          </div>
          <div className="stats">
            <div>
              <span>{isAdmin ? "Всички резервации" : "Мои резервации"}</span>
              <strong>{visible.length.toString().padStart(2, "0")}</strong>
            </div>
            <div>
              <span>{isAdmin ? "Клиенти" : "Отдели"}</span>
              <strong>{isAdmin ? customers.length : businesses.length}</strong>
            </div>
            <div>
              <span>Избран отдел</span>
              <strong className="stat-department">{business.name}</strong>
            </div>
          </div>
          {warning && (
            <p className="notice warning" role="alert">
              {warning}
            </p>
          )}
          <p className="notice" role="status" aria-live="polite">
            {message ||
              (isAdmin
                ? "Филтрирайте по клиент, отдел или дата."
                : "Изберете отдел, специалист или хотел и свободен период.")}
          </p>
          {(!isAdmin || editing) && (
            <ReservationEditor
              key={`${profileId}-${businessId}-${formVersion}`}
              business={business}
              profile={profile}
              index={index}
              editing={editing}
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
            <span>място · Универсална система за резервации</span>
            <span>Демо профили · React + Vite</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
