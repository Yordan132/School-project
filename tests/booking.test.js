import test from 'node:test';
import assert from 'node:assert/strict';
import { buildIndex, buildOccupancy, getSlots, validateBooking, bookingKey } from '../src/utils/booking.js';
const business = { id: 'demo', step: 30, durations: [30, 60, 90], hours: {1: [[540, 720], [780, 1020]]}, resources: [{ id: 'r', capacity: 3 }] };
const base = { id: 'a', businessId: 'demo', resourceId: 'r', date: '2026-11-16', start: 540, end: 600, quantity: 2, customer: 'Иван' };
const check = (changes = {}, bookings = []) => validateBooking({...base, ...changes}, business, bookings);
test('allows adjacent bookings but rejects exceeding concurrent capacity', () => {
 assert.equal(check({id: 'b', start: 600, end: 660}, [base]), '');
 assert.match(check({id: 'b', start: 570, end: 630}, [base]), /капацитет/);
});
test('accepts exact capacity and excludes edited booking', () => {
 assert.equal(check({id: 'b', quantity: 1}, [base]), '');
 assert.equal(check({}, [base]), '');
});
test('does not sum reservations that do not overlap each other', () => {
 const bookings = [base, {...base, id:'b', start:600, end:630}];
 assert.equal(check({id:'c', start:570, end:630, quantity:1}, bookings), '');
});
test('rejects closed day, breaks, wrong grid, invalid duration and quantity', () => {
 for (const changes of [{date:'2026-11-15'}, {start:690,end:810}, {start:541,end:601}, {end:540}, {quantity:0}, {quantity:1.5}, {quantity:4}, {date:'2026-02-30'}, {resourceId:'missing'}, {customer:'  '}]) assert.notEqual(check(changes), '');
});
test('index isolates business, date and resource', () => {
 const index = buildIndex([base, {...base,id:'b',businessId:'other'}]);
 assert.equal(index.get(bookingKey('demo','r',base.date)).length, 1);
});
test('slots show remaining places, omit breaks and stop at closing', () => {
 const profile = buildOccupancy([base], 30);
 const slots = getSlots(business, business.resources[0], base.date, 60, 1, profile);
 assert.equal(slots[0].remaining, 1);
 assert.ok(slots.some(s=>s.start===660));
 assert.ok(!slots.some(s=>s.start===690));
 assert.equal(slots.at(-1).start, 960);
 assert.equal(getSlots(business,business.resources[0],'2026-11-15',60,1,profile).length,0);
});
