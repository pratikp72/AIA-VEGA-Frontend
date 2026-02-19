// Application Constants

// Colors
export const COLORS = {
  PRIMARY: '#9C2EDB',
  PRIMARY_LIGHT: '#F4E2FF',
  PRIMARY_DARK: '#7a1fa8',
  PRIMARY_OPACITY_20: '#9C2EDB33',
  PRIMARY_OPACITY_10: '#9C2EDB1A',
  SUCCESS: '#29A366',
  SUCCESS_LIGHT: '#46BD84',
  SUCCESS_GREEN: '#22C55E',
  SUCCESS_GREEN_DARK: '#1aad50',
  ERROR: '#EF4444',
  ERROR_LIGHT_BG: '#FEE2E2',
  ERROR_LIGHTER_BG: '#FECACA',
  WARNING: '#FD8C02',
  WARNING_LIGHT_BG: '#FFF8EB',
  WARNING_LIGHTER_BG: '#F7E4C1',
  INFO_TEAL: '#3DD598',
  INFO_TEAL_OPACITY: '#3DD5981A',
  ORANGE: '#FFA412',
  ORANGE_OPACITY: '#FFA4121A',
  YELLOW: '#EFBF04',
  LOCKED_BG: '#EDEFF3',
  GRAY_500: '#6B7280',
  GRAY_BG: '#F3F4F6',
  GRAY_LIGHT_BG: '#F9FAFB',
  GRAY_VERY_LIGHT_BG: '#FAFAFA',
  BLACK_OPACITY: '#00000099',
  BLUE_LIGHT: '#ECF3FE',
  WHITE: '#FFFFFF',
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  TIMEOUT: 10000,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  THEME: 'theme',
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  // Add more routes as needed
};

// Toast Messages
export const TOAST_MESSAGES = {
  SUCCESS: {
    LOGIN: 'Login successful!',
    LOGOUT: 'Logged out successfully',
    CREATED: 'Created successfully',
    UPDATED: 'Updated successfully',
    DELETED: 'Deleted successfully',
  },
  ERROR: {
    LOGIN_FAILED: 'Login failed. Please check your credentials.',
    NETWORK_ERROR: 'Network error. Please try again.',
    GENERIC: 'Something went wrong. Please try again.',
  },
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// Form Validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// Export all constants
export default {
  COLORS,
  API_CONFIG,
  STORAGE_KEYS,
  ROUTES,
  TOAST_MESSAGES,
  PAGINATION,
  VALIDATION,
};
