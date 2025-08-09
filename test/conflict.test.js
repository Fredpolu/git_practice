import assert from 'assert';
import { hasConflict } from '../js/scheduler.js';

const events = [
  { id: 1, day: 0, start: 9, end: 10 },
  { id: 2, day: 0, start: 11, end: 12 }
];

// Overlapping event
const ev1 = { id: 3, day: 0, start: 9.5, end: 10.5 };
assert.strictEqual(hasConflict(ev1, events), true, 'Should detect conflict');

// Non-overlapping
const ev2 = { id: 4, day: 0, start: 10, end: 11 };
assert.strictEqual(hasConflict(ev2, events), false, 'Should not detect conflict');

console.log('Conflict tests passed');
