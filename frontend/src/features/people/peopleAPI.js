import api from '@/services/api';
import API_ENDPOINTS from '@/services/endpoints';
import { USE_MOCK_DATA, mockDelay } from '@/services/mockData';

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

export const fetchPeople = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(400);
    const { MOCK_HOME_DATA } = await import('@/services/mockData');
    return (MOCK_HOME_DATA.people || []);
  }
  const response = await api.get(API_ENDPOINTS.USERS.LIST);
  const raw = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
  return raw.map(normalizeUser);
};

export default {
  fetchPeople,
};
