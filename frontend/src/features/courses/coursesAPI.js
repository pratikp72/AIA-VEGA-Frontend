import api from '@/services/api';
import API_ENDPOINTS from '@/services/endpoints';
import { USE_MOCK_DATA, mockDelay, MOCK_COURSE_CATEGORIES } from '@/services/mockData';

export const fetchCourseCategories = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    return MOCK_COURSE_CATEGORIES;
  }

  // TODO: update when backend categories endpoint is available
  return await api.get(API_ENDPOINTS.COURSES.LIST);
};

export default {
  fetchCourseCategories,
};
