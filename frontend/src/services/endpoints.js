// Centralized API Endpoints
// Update these endpoints when backend is ready

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    ME: '/auth/me',
  },

  // User endpoints
  USERS: {
    LIST: '/users',
    GET: (id) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    PROFILE: '/users/profile',
  },

  // Add more endpoint groups as needed
  // PRODUCTS: {
  //   LIST: '/products',
  //   GET: (id) => `/products/${id}`,
  //   CREATE: '/products',
  //   UPDATE: (id) => `/products/${id}`,
  //   DELETE: (id) => `/products/${id}`,
  // },
  // Home/Dashboard endpoints
  HOME: {
    DASHBOARD: '/dashboard',
    NEWS: '/dashboard/news',
    QUICK_LINKS: '/dashboard/quick-links',
    EVENTS: '/dashboard/events',
    NEW_JOINEES: '/dashboard/new-joinees',
    MY_COURSES: '/dashboard/my-courses',
    BIRTHDAYS_TODAY: '/dashboard/birthdays-today',
    WORK_ANNIVERSARIES: '/dashboard/work-anniversaries',
  },

  // News endpoints
  NEWS: {
    LIST: '/news',
    GET: (id) => `/news/${id}`,
  },

  // People endpoints
  PEOPLE: {
    LIST: '/people',
    GET: (id) => `/people/${id}`,
  },

  // Calendar endpoints
  CALENDAR: {
    EVENTS: '/calendar/events',
  },

  // Courses endpoints
  COURSES: {
    LIST: '/courses',
    GET: (id) => `/courses/${id}`,
    MY_COURSES: '/courses/my-courses',
  },

};

export default API_ENDPOINTS;
