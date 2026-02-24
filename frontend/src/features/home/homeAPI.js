import api from '@/services/api';
import API_ENDPOINTS from '@/services/endpoints';
import { USE_MOCK_DATA, mockDelay, MOCK_HOME_DATA } from '@/services/mockData';

// News is loaded via news slice (loadAllNews). Carousel reads from state.news via selector.

// ==================== DASHBOARD DATA ====================
export const fetchDashboardData = async () => {
  const rest = USE_MOCK_DATA
    ? await mockDelay().then(() => MOCK_HOME_DATA.dashboard)
    : await Promise.resolve(MOCK_HOME_DATA.dashboard);
  return { ...rest };
};

// ==================== QUICK LINKS ====================
export const fetchQuickLinks = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    return MOCK_HOME_DATA.quickLinks;
  }
  
  // 🔌 BACKEND INTEGRATION: Uncomment when ready
  // return await api.get(API_ENDPOINTS.HOME.QUICK_LINKS);
  
  return MOCK_HOME_DATA.quickLinks;
};

// ==================== UPCOMING EVENTS ====================
export const fetchUpcomingEvents = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(400);
    return MOCK_HOME_DATA.events;
  }
  
  // 🔌 BACKEND INTEGRATION: Uncomment when ready
  // return await api.get(API_ENDPOINTS.HOME.EVENTS);
  
  return MOCK_HOME_DATA.events;
};

// ==================== NEW JOINEES ====================
export const fetchNewJoinees = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(400);
    return MOCK_HOME_DATA.newJoinees;
  }
  
  // 🔌 BACKEND INTEGRATION: Uncomment when ready
  // return await api.get(API_ENDPOINTS.HOME.NEW_JOINEES);
  
  return MOCK_HOME_DATA.newJoinees;
};

// ==================== MY COURSES ====================
export const fetchMyCourses = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(500);
    return MOCK_HOME_DATA.courses;
  }
  
  // 🔌 BACKEND INTEGRATION: Uncomment when ready
  // return await api.get(API_ENDPOINTS.HOME.MY_COURSES);
  
  return MOCK_HOME_DATA.courses;
};

// ==================== BIRTHDAYS TODAY ====================
export const fetchBirthdaysToday = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    return MOCK_HOME_DATA.birthdays;
  }
  
  // 🔌 BACKEND INTEGRATION: Uncomment when ready
  // return await api.get(API_ENDPOINTS.HOME.BIRTHDAYS_TODAY);
  
  return MOCK_HOME_DATA.birthdays;
};

// ==================== WORK ANNIVERSARIES ====================
export const fetchWorkAnniversaries = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    return MOCK_HOME_DATA.anniversaries;
  }
  
  // 🔌 BACKEND INTEGRATION: Uncomment when ready
  // return await api.get(API_ENDPOINTS.HOME.WORK_ANNIVERSARIES);
  
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