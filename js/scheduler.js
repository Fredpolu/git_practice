export const categories = {
  'Corporate': '#1a237e',
  'Association A': '#00796b',
  'Association B': '#6a1b9a',
  'Association C': '#fb8c00',
  'Personal': '#757575'
};

export const events = [];
let idCounter = 0;

export function addEvent(data) {
  const event = { id: idCounter++, ...data };
  if (hasConflict(event, events)) {
    return false;
  }
  events.push(event);
  return true;
}

export function generateRecurrence(event, weeks) {
  const list = [];
  for (let i = 0; i < weeks; i++) {
    const copy = { ...event, day: (event.day + i) % 7 };
    list.push(copy);
  }
  return list;
}

export function hasConflict(event, list) {
  return list.some(e =>
    e.id !== event.id &&
    e.day === event.day &&
    e.start < event.end &&
    event.start < e.end
  );
}

export function removeEvent(id) {
  const idx = events.findIndex(e => e.id === id);
  if (idx >= 0) events.splice(idx, 1);
}
