import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response.data; // Return only data portion
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          console.error('Bad Request:', data?.error?.message || data?.message || 'Invalid request parameters');
          break;
        case 401:
          // ✅ Only redirect if NOT already on the login page
          // This prevents a redirect loop when the user submits wrong credentials
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Forbidden - You dont have permission');
          break;
        case 404:
          console.warn('Resource not found:', error.config?.url);
          break;
        case 422:
          console.error('Validation Error:', data?.error?.message || data?.message || 'Invalid data provided');
          break;
        case 500:
          console.error('Server error:', error.config?.url, data?.error?.message || data?.message || data);
          break;
        case 502:
          console.error('Bad Gateway - Server unavailable');
          break;
        case 503:
          console.error('Service Unavailable - Server temporarily down');
          break;
        default:
          console.error(`HTTP ${status} Error at ${error.config?.url}:`, data?.error?.message || data?.message || data || 'Unknown error');
      }

      const rejectPayload =
        typeof data === 'object' && data !== null
          ? { ...data, status }
          : { message: data || error.message, status };

      return Promise.reject(rejectPayload);
    } else if (error.request) {
      console.error('Network error - No response from server');
      return Promise.reject({ message: 'Network error. Please check your connection.' });
    } else {
      console.error('Error:', error.message);
      return Promise.reject(error);
    }
  }
);

// Deduplicate GET requests
const DEDUPE_MS = 300;
const inFlight = new Map();
const recentCache = new Map();
const originalGet = api.get.bind(api);
api.get = function (url, config) {
  const params = config?.params ?? {};
  const key = `${url}?${JSON.stringify(params)}`;
  const now = Date.now();
  const cached = recentCache.get(key);
  if (cached && now - cached.at < DEDUPE_MS) return cached.promise;
  if (inFlight.has(key)) return inFlight.get(key);
  const promise = originalGet(url, config);
  inFlight.set(key, promise);
  promise.finally(() => {
    inFlight.delete(key);
    recentCache.set(key, { promise, at: Date.now() });
    setTimeout(() => recentCache.delete(key), DEDUPE_MS);
  });
  return promise;
};

export default api;

export const apiService = {
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  patch: (url, data, config) => api.patch(url, data, config),
  delete: (url, config) => api.delete(url, config),
};