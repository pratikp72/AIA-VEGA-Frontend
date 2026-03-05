/**
 * Calendar events API – only API calls. No Redux.
 */
import api from '@/services/api';
import { USE_MOCK_DATA, mockDelay } from '@/services/mockData';
import { MOCK_CALENDAR_EVENTS, MOCK_CALENDAR_HOLIDAYS } from '@/services/mockData';
import { fetchEmployeeBirthdays, fetchEmployeeAnniversaries } from '@/features/people/peopleAPI';

const EVENT_TYPE_COLORS = {
  'Training session': '#00F078',
  Conference: '#2563EB',
  Workshop: '#9C2EDB',
};
const DEFAULT_EVENT_COLOR = '#2563EB';

function formatEventTime(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function colorForEventType(eventType) {
  return (eventType && EVENT_TYPE_COLORS[eventType]) || DEFAULT_EVENT_COLOR;
}

function normalizeEvent(item) {
  const start = item.start_date;
  const eventType = item.event_type;
  const color = colorForEventType(eventType);
  return {
    id: item.documentId ?? item.id,
    documentId: item.documentId,
    title: item.title,
    description: item.description?.replace(/<[^>]+>/g, '') || '',
    date: start ? new Date(start).toISOString().slice(0, 10) : '',
    time: formatEventTime(start),
    location: item.event_location || '',
    event_type: eventType,
    start_date: item.start_date,
    end_date: item.end_date,
    color,
    fullTitle: item.title,
    icon: 'calendar',
  };
}

/** GET /events – all events for the calendar (no homepage filter) */
export async function fetchEvents() {
  if (USE_MOCK_DATA) {
    await mockDelay(400);
    return MOCK_CALENDAR_EVENTS;
  }
  const res = await api.get('/events');
  const raw = Array.isArray(res?.data) ? res.data : [];
  const active = raw.filter((e) => e.active !== false);
  return active.map(normalizeEvent);
}

/** GET /events/{documentId} – single event for detail view */
export async function fetchEventById(documentId) {
  if (USE_MOCK_DATA) {
    await mockDelay(200);
    const found = MOCK_CALENDAR_EVENTS.find((e) => String(e.id) === String(documentId));
    return found ?? null;
  }
  const res = await api.get(`/events/${documentId}`);
  const data = res?.data;
  if (!data) return null;
  return normalizeEvent(data);
}

function normalizeHoliday(item) {
  return {
    id: item.documentId ?? item.id,
    documentId: item.documentId,
    title: item.title,
    date: item.date ? new Date(item.date).toISOString().slice(0, 10) : '',
    holiday_for: item.holiday_for,
  };
}

/** GET /holidays – all holidays for the calendar */
export async function fetchHolidays() {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    return MOCK_CALENDAR_HOLIDAYS;
  }
  const res = await api.get('/holidays');
  const raw = Array.isArray(res?.data) ? res.data : [];
  const active = raw.filter((h) => h.active !== false);
  return active.map(normalizeHoliday);
}

/** GET employee birthdays for the calendar */
export { fetchEmployeeBirthdays };

/** GET employee work anniversaries for the calendar */
export { fetchEmployeeAnniversaries };
