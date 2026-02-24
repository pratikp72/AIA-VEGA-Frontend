import api from '@/services/api';
import API_ENDPOINTS from '@/services/endpoints';
import { USE_MOCK_DATA, mockDelay, MOCK_HOME_DATA } from '@/services/mockData';

// News is loaded via news slice (loadAllNews). Carousel reads from state.news via selector.

export const fetchDashboardData = async () => {
  const rest = USE_MOCK_DATA
    ? await mockDelay().then(() => MOCK_HOME_DATA.dashboard)
    : await Promise.resolve(MOCK_HOME_DATA.dashboard);
  if (!USE_MOCK_DATA) {
    const [events, newJoinees, courses] = await Promise.all([
      fetchUpcomingEvents(),
      fetchNewJoinees(),
      fetchMyCourses(),
    ]);
    return { ...rest, events, newJoinees, courses };
  }
  return { ...rest };
};

export const fetchQuickLinks = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    return MOCK_HOME_DATA.quickLinks;
  }
  return MOCK_HOME_DATA.quickLinks;
};

function formatEventTime(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function normalizeEvent(item) {
  const start = item.start_date;
  return {
    id: item.documentId ?? item.id,
    documentId: item.documentId,
    title: item.title,
    description: item.description?.replace(/<[^>]+>/g, '') || '',
    date: start ? new Date(start).toISOString().slice(0, 10) : '',
    time: formatEventTime(start),
    location: item.event_location || '',
    event_type: item.event_type,
    start_date: item.start_date,
    end_date: item.end_date,
  };
}

export const fetchUpcomingEvents = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(400);
    return MOCK_HOME_DATA.events;
  }

  const res = await api.get('/events');
  const raw = Array.isArray(res?.data) ? res.data : [];
  const forHome = raw.filter((e) => e.active !== false && e.visible_on_homepage === true);
  return forHome.map(normalizeEvent);
};

function normalizeUser(user) {
  const name = user.employee_name || user.username || 'Unknown';
  const joinDate = user.joining_date || null;
  const now = new Date();
  const isNew = joinDate
    ? (now - new Date(joinDate)) / (1000 * 60 * 60 * 24) <= 30
    : false;
  return {
    id: user.id,
    documentId: user.documentId,
    name,
    email: user.email || '',
    phone: user.contact_no || '',
    position: user.designation || '',
    title: user.designation || '',
    department: user.department || '',
    location: user.working_location || '',
    joinDate,
    company: user.company || '',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    isNew,
  };
}

export const fetchNewJoinees = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(400);
    return MOCK_HOME_DATA.newJoinees;
  }
  const response = await api.get(API_ENDPOINTS.USERS.LIST);
  const raw = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
  const users = raw.map(normalizeUser);
  const sorted = users
    .filter(u => u.joinDate)
    .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));
  return sorted.slice(0, 4);
};

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api').replace(/\/api\/?$/, '');

function withImageUrl(imageObj) {
  if (!imageObj) return null;
  const url =
    imageObj.formats?.large?.url ||
    imageObj.formats?.medium?.url ||
    imageObj.formats?.small?.url ||
    imageObj.formats?.thumbnail?.url ||
    imageObj.url;
  if (!url) return null;
  return url.startsWith('http') ? url : BASE_URL + (url.startsWith('/') ? url : `/${url}`);
}

export const fetchMyCourses = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(500);
    return MOCK_HOME_DATA.courses;
  }
  const response = await api.get(API_ENDPOINTS.COURSES.LIST, { params: { populate: '*' } });
  const raw = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
  return raw
    .filter(c => c.active !== false)
    .slice(0, 4)
    .map(c => ({
      id: c.id,
      documentId: c.documentId,
      title: c.title || '',
      thumbnail: withImageUrl(c.thumbnail),
      progress: 0,
      completedLessons: 0,
      totalLessons: 0,
      deadline: '2026-12-31',
    }));
};

export const fetchBirthdaysToday = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    return MOCK_HOME_DATA.birthdays;
  }
  
  return MOCK_HOME_DATA.birthdays;
};

export const fetchWorkAnniversaries = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    return MOCK_HOME_DATA.anniversaries;
  }
  
  return MOCK_HOME_DATA.anniversaries;
};

export default {
  fetchDashboardData,
  fetchQuickLinks,
  fetchUpcomingEvents,
  fetchNewJoinees,
  fetchMyCourses,
  fetchBirthdaysToday,
  fetchWorkAnniversaries,
};