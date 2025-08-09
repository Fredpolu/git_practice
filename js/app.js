import { categories, events, addEvent, generateRecurrence, hasConflict } from './scheduler.js';

const calendarEl = document.getElementById('calendar');
const dayBtn = document.getElementById('dayViewBtn');
const weekBtn = document.getElementById('weekViewBtn');
const agendaBtn = document.getElementById('agendaViewBtn');
const form = document.getElementById('eventForm');

let currentView = 'week';
let currentDay = 0; // Monday

function render() {
  if (currentView === 'day') renderDayView(currentDay); 
  else if (currentView === 'agenda') renderAgendaView();
  else renderWeekView();
}

dayBtn.addEventListener('click', () => { currentView = 'day'; currentDay = 0; render(); });
weekBtn.addEventListener('click', () => { currentView = 'week'; render(); });
agendaBtn.addEventListener('click', () => { currentView = 'agenda'; render(); });

form.addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(form);
  const event = {
    title: data.get('title'),
    category: data.get('category'),
    color: categories[data.get('category')],
    day: Number(data.get('day')),
    start: Number(data.get('start')),
    end: Number(data.get('end')),
    priority: data.get('priority')
  };
  const recur = Number(data.get('recur'));
  if (!addEvent(event)) {
    alert('Conflict detected');
    return;
  }
  if (recur > 0) {
    const recEvents = generateRecurrence(event, recur);
    recEvents.forEach(ev => {
      if (!addEvent(ev)) alert('Conflict in recurrence');
    });
  }
  form.reset();
  render();
});

function renderWeekView() {
  calendarEl.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'week-grid';
  for (let d = 0; d < 7; d++) {
    const col = document.createElement('div');
    col.className = 'day-column';
    col.dataset.day = d;
    for (let h = 8; h < 20; h++) {
      const slot = document.createElement('div');
      slot.className = 'hour-slot';
      slot.dataset.day = d;
      slot.dataset.hour = h;
      slot.addEventListener('dragover', e => e.preventDefault());
      slot.addEventListener('drop', handleDrop);
      col.appendChild(slot);
    }
    grid.appendChild(col);
  }
  // render events
  events.forEach(ev => {
    const col = grid.children[ev.day];
    const el = document.createElement('div');
    el.className = 'event';
    el.textContent = ev.title;
    el.style.background = ev.color;
    el.style.top = (ev.start - 8) * 60 + 'px';
    el.style.height = (ev.end - ev.start) * 60 + 'px';
    el.draggable = true;
    el.dataset.id = ev.id;
    el.addEventListener('dragstart', handleDragStart);
    col.appendChild(el);
  });
  calendarEl.appendChild(grid);
}

function renderDayView(day) {
  const dayEvents = events.filter(e => e.day === day);
  calendarEl.innerHTML = '<h2>Day View</h2>';
  const list = document.createElement('ul');
  dayEvents.sort((a,b)=>a.start-b.start).forEach(ev => {
    const li = document.createElement('li');
    li.textContent = `${ev.start}:00 - ${ev.end}:00 ${ev.title}`;
    li.style.color = ev.color;
    list.appendChild(li);
  });
  calendarEl.appendChild(list);
}

function renderAgendaView() {
  calendarEl.innerHTML = '<h2>Agenda</h2>';
  const list = document.createElement('ul');
  list.className = 'agenda-list';
  events.slice().sort((a,b)=>a.day - b.day || a.start - b.start).forEach(ev => {
    const li = document.createElement('li');
    li.textContent = `${dayName(ev.day)} ${ev.start}:00 - ${ev.end}:00 ${ev.title}`;
    li.style.color = ev.color;
    list.appendChild(li);
  });
  calendarEl.appendChild(list);
}

function dayName(d) {
  return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][d];
}

let draggedId = null;
function handleDragStart(e) {
  draggedId = Number(e.target.dataset.id);
}

function handleDrop(e) {
  e.preventDefault();
  const day = Number(e.currentTarget.dataset.day);
  const hour = Number(e.currentTarget.dataset.hour);
  const ev = events.find(ev => ev.id === draggedId);
  if (!ev) return;
  const duration = ev.end - ev.start;
  const newEvent = { ...ev, day, start: hour, end: hour + duration };
  if (newEvent.end > 20 || hasConflict(newEvent, events)) {
    alert('Invalid move');
    return;
  }
  ev.day = day;
  ev.start = hour;
  ev.end = hour + duration;
  render();
}

render();
