/**
 * Calendar events API – only API calls. No Redux.
 */
import api from '@/services/api';
import { USE_MOCK_DATA, mockDelay } from '@/services/mockData';
import { MOCK_CALENDAR_EVENTS, MOCK_CALENDAR_HOLIDAYS } from '@/services/mockData';
import { fetchEmployeeBirthdays, fetchEmployeeAnniversaries } from '@/features/people/peopleAPI';

/** Event type → color. Keys normalized to lowercase for matching. */
const EVENT_TYPE_COLORS = {
  conference: '#2563EB',
  workshop: '#F0C51A',
  'training session': '#00F078',
  birthday: '#FD8C02',
  'work anniversary': '#9C2EDB',
  anniversary: '#9C2EDB',
  holidays: '#EF4444',
};
const DEFAULT_EVENT_COLOR = '#2563EB';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337').replace(/\/api\/?$/, '');

function getEventImageUrl(eventImage) {
  if (!eventImage) return '';
  const raw = eventImage?.url ?? eventImage?.data?.attributes?.url ?? eventImage?.formats?.thumbnail?.url ?? eventImage?.formats?.small?.url;
  if (!raw) return '';
  return raw.startsWith('http') ? raw : `${API_BASE}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

function formatEventTime(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function colorForEventType(eventType) {
  if (!eventType) return DEFAULT_EVENT_COLOR;
  const key = String(eventType).toLowerCase().trim();
  return EVENT_TYPE_COLORS[key] || DEFAULT_EVENT_COLOR;
}

function normalizeEvent(item) {
  const start = item.start_date;
  const eventType = item.event_type;
  const color = colorForEventType(eventType);
  const eventImageUrl = getEventImageUrl(item.event_image);
  // Resolve department name from relation (Strapi v5 flat or v4 nested)
  const deptRaw = item.department;
  const department_name =
    deptRaw?.name ||
    deptRaw?.data?.attributes?.name ||
    deptRaw?.attributes?.name ||
    null;
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
    event_image: eventImageUrl,
    // Department visibility fields
    event_created_for: item.event_created_for || 'All',
    department_name,
  };
}

/** GET /events – all events for the calendar (no homepage filter) */
export async function fetchEvents() {
  if (USE_MOCK_DATA) {
    await mockDelay(400);
    return MOCK_CALENDAR_EVENTS;
  }
  const res = await api.get('/events', {
    params: { sort: 'start_date:asc' },
  });
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
  const res = await api.get('/holidays', {
    params: { sort: 'date:asc' },
  });
  const raw = Array.isArray(res?.data) ? res.data : [];
  const active = raw.filter((h) => h.active !== false);
  return active.map(normalizeHoliday);
}

/** GET employee birthdays for the calendar */
export { fetchEmployeeBirthdays };

/** GET employee work anniversaries for the calendar */
export { fetchEmployeeAnniversaries };
