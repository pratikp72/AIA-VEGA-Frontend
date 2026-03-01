import api from '@/services/api';
import { API_ENDPOINTS } from '@/services/endpoints';
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

/**
 * Fetch paginated + filtered people from /analytics/employees.
 * All filtering is done server-side.
 */
export const fetchPeople = async ({
  company = '',
  department = '',
  location = '',
  search = '',
  sort = '',
  page = 1,
  pageSize = 9,
} = {}) => {
  if (USE_MOCK_DATA) {
    await mockDelay(400);
    const { MOCK_HOME_DATA } = await import('@/services/mockData');
    return {
      items: MOCK_HOME_DATA.people || [],
      totalPages: 1,
      totalCount: (MOCK_HOME_DATA.people || []).length,
      currentPage: 1,
    };
  }

  console.log('[fetchPeople] called with:', { company, department, location, search, sort, page, pageSize });

  const params = { page, pageSize };

  if (company) params.company = company;
  if (department) params.department = department;
  if (location) params.location = location;
  if (search) params.search = search;
  // sortBy values match the sortFieldMap keys in analyticsShared.js
  if (sort) params.sortBy = sort;

  const response = await api.get(API_ENDPOINTS.ANALYTICS.EMPLOYEES, { params });

  // /analytics/employees returns { items, total, page, pageSize, totalPages }
  const items = (response?.items || []).map(normalizeUser);
  return {
    items,
    totalPages: response?.totalPages || 1,
    totalCount: response?.total || items.length,
    currentPage: response?.page || page,
  };
};

/**
 * Fetch unique department and location options for the given company.
 * Uses dedicated analytics endpoints for efficiency.
 */
export const fetchPeopleOptions = async (company = '') => {
  if (USE_MOCK_DATA) {
    return { departments: [], locations: [] };
  }

  const params = company ? { company } : {};

  const [deptRes, locRes] = await Promise.all([
    api.get(API_ENDPOINTS.ANALYTICS.DEPARTMENTS, { params }),
    api.get(API_ENDPOINTS.ANALYTICS.UNIT_LOCATIONS, { params }),
  ]);

  const departments = (Array.isArray(deptRes) ? deptRes : [])
    .map((d) => d.name)
    .filter(Boolean)
    .sort();

  const locations = (Array.isArray(locRes) ? locRes : [])
    .map((l) => l.name)
    .filter(Boolean)
    .sort();

  return { departments, locations };
};

export default { fetchPeople, fetchPeopleOptions };
