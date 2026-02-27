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
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Forbidden - You dont have permission');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('An error occurred:', data?.message || 'Unknown error');
      }
      
      return Promise.reject(data || error.message);
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error - No response from server');
      return Promise.reject({ message: 'Network error. Please check your connection.' });
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject(error);
    }
  }
);

// Deduplicate GET requests: same url+params within a short window = one request (fixes double calls from Strict Mode / double mount)
const DEDUPE_MS = 300;
const inFlight = new Map();
const recentCache = new Map(); // key -> { promise, at }
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

// Helper functions for different HTTP methods
export const apiService = {
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  patch: (url, data, config) => api.patch(url, data, config),
  delete: (url, config) => api.delete(url, config),
};
