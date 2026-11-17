import React, { memo } from 'react';
import { formatTime } from '../utils/booking.js';

export default memo(function SlotGrid({ slots, selected, onSelect, onlyAvailable }) {
  const visible = onlyAvailable ? slots.filter(slot => slot.available) : slots;
  if (!visible.length) return <div className="empty">Няма свободни часове за този избор. Опитайте друга дата или ресурс.</div>;
  return <div className="slots">{visible.map(slot => <button key={slot.start} type="button"
    className={`slot ${selected === slot.start ? 'selected' : ''}`} disabled={!slot.available}
    aria-pressed={selected === slot.start} onClick={() => onSelect(slot.start)}>
    <strong>{formatTime(slot.start)}</strong><span>{slot.remaining > 0 ? `${slot.remaining} свободни` : 'Заето'}</span>
  </button>)}</div>;
});
