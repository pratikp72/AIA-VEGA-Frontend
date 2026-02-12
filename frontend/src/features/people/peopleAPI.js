import api from '@/services/api';
import API_ENDPOINTS from '@/services/endpoints';
import { USE_MOCK_DATA, mockDelay, MOCK_PEOPLE } from '@/services/mockData';

export const fetchPeople = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(400);
    return MOCK_PEOPLE;
  }

  // BACKEND INTEGRATION: uncomment when ready
  // const response = await api.get(API_ENDPOINTS.PEOPLE.LIST);
  // if (Array.isArray(response)) return response;
  // return response?.people || response?.data || [];

  return [];
};

export default {
  fetchPeople,
};
