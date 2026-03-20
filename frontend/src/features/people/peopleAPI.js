import api from '@/services/api';
import { API_ENDPOINTS } from '@/services/endpoints';
import { USE_MOCK_DATA, mockDelay } from '@/services/mockData';
import { getAvatarPropsForEmployee } from '@/lib/avatar';
import { fetchAllAnalyticsEmployees } from '@/services/analyticsEmployeesPagination';
function getCurrentUserCompany() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.company ?? null;
  } catch {
    return null;
  }
}

function normalizeCompanyForFilter(company) {
  const c = String(company ?? '').trim();
  if (!c) return null;
  const upper = c.toUpperCase();
  if (upper === 'AIA') return 'AIA';
  if (upper === 'VEGA') return 'Vega';
  return null;
}

function normalizeUser(user) {
  const name = user.employee_name || user.username || 'Unknown';
  const joinDate = user.joining_date || null;
  const dateOfBirth = user.date_of_birth || null;
  const now = new Date();
  const isNew = joinDate
    ? (now - new Date(joinDate)) / (1000 * 60 * 60 * 24) <= 30
    : false;
  const company = user.company || '';
  const yearsAtCompany = joinDate ? now.getFullYear() - new Date(joinDate).getFullYear() : null;
  const avatar = getAvatarPropsForEmployee(user);
  return {
    id: user.id,
    documentId: user.documentId,
    name,
    email: user.email || '',
    phone: user.contact_no || '',
    position: user.designation || '',
    title: user.designation || '',
    department: user.department || '',
    // For AIA, treat branch as location; for Vega, use working_location
    location: company === 'AIA' ? (user.branch || '') : (user.working_location || ''),
    branch: user.branch || '',
    joinDate,
    dateOfBirth,
    company,
    emp_code: user.emp_code || '',
    emp_id: user.emp_id || '',
    description: user.description || '',
    avatar: avatar.src,
    avatarInitial: avatar.initials,
    isNew,
    yearsAtCompany,
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
 * Fetch employees' birthdays and anniversaries for calendar display
 */
export const fetchEmployeeBirthdays = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    return generateMockBirthdaysAndAnniversaries().birthdays;
  }

  try {
    const company = normalizeCompanyForFilter(getCurrentUserCompany());
    const employees = await fetchAllAnalyticsEmployees(
      api,
      API_ENDPOINTS.ANALYTICS.EMPLOYEES,
      { ...(company && { company }) }
    );
    const today = new Date();
    const currentYear = today.getFullYear();
    
    return employees
      .filter(emp => emp.date_of_birth && emp.blocked !== true)
      .map(emp => {
        const birthday = new Date(emp.date_of_birth);
        // Use UTC to avoid timezone shift (e.g. "1990-03-06" is midnight UTC; getMonth/getDate would give March 5 in US timezones)
        const month = birthday.getUTCMonth();
        const day = birthday.getUTCDate();
        const dateKey = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        return {
          id: `birthday-${emp.id}`,
          title: `🎂 ${emp.employee_name || emp.username}'s Birthday`,
          date: dateKey,
          employee: normalizeUser(emp),
          type: 'birthday',
          color: '#FD8C02',
          allDay: true
        };
      });
  } catch (error) {
    console.warn('Failed to fetch birthdays:', error);
    // Fallback to mock data if API fails
    return generateMockBirthdaysAndAnniversaries().birthdays;
  }
};

export const fetchEmployeeAnniversaries = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    return generateMockBirthdaysAndAnniversaries().anniversaries;
  }

  try {
    const company = normalizeCompanyForFilter(getCurrentUserCompany());
    const employees = await fetchAllAnalyticsEmployees(
      api,
      API_ENDPOINTS.ANALYTICS.EMPLOYEES,
      { ...(company && { company }) }
    );
    const today = new Date();
    const currentYear = today.getFullYear();
    
    return employees
      .filter(emp => emp.joining_date)
      .map(emp => {
        const joinDate = new Date(emp.joining_date);
        // Use UTC to avoid timezone shift (e.g. "2020-03-06" is midnight UTC; getMonth/getDate would give March 5 in US timezones)
        const month = joinDate.getUTCMonth();
        const day = joinDate.getUTCDate();
        const yearsOfService = currentYear - joinDate.getUTCFullYear();
        
        // Only show if it's been at least 1 year
        if (yearsOfService < 1) return null;
        
        const dateKey = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return {
          id: `anniversary-${emp.id}`,
          title: `🏢 ${emp.employee_name || emp.username} - ${yearsOfService} Year${yearsOfService > 1 ? 's' : ''} work anniversary`,
          date: dateKey,
          employee: normalizeUser(emp),
          type: 'anniversary',
          color: '#9C2EDB',
          allDay: true,
          yearsOfService
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.warn('Failed to fetch anniversaries:', error);
    return generateMockBirthdaysAndAnniversaries().anniversaries;
  }
};

// Mock data generator for birthdays and anniversaries
function generateMockBirthdaysAndAnniversaries() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  // Create some mock birthdays for March (current month) and other months
  const mockEmployees = [
    { id: 1, name: 'John Doe Updated', joinDate: '2024-02-23', birthday: '1985-03-08', department: 'Engineering', position: 'Senior Manager' },
    { id: 2, name: 'abc', joinDate: '2026-02-11', birthday: '1990-03-12', department: 'HR', position: 'll' },
    { id: 3, name: 'bob', joinDate: '2026-02-19', birthday: '1992-03-15', department: 'HR department', position: 'intern' },
    { id: 4, name: 'max', joinDate: '2019-02-26', birthday: '1988-03-20', department: 'Sales', position: 'manager' },
    { id: 5, name: 'dummy user', joinDate: '2026-02-03', birthday: '1995-07-25', department: 'Engineering', position: '24' },
    { id: 6, name: 'mike', joinDate: '2026-02-20', birthday: '1987-11-30', department: 'Support', position: 'senior manager' },
    { id: 7, name: 'Tom', joinDate: '2026-02-17', birthday: '1993-05-18', department: 'HR', position: 'HR' }
  ];
  
  const birthdays = mockEmployees.map(emp => {
    const birthday = new Date(emp.birthday);
    const month = birthday.getUTCMonth();
    const day = birthday.getUTCDate();
    const dateKey = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return {
      id: `birthday-${emp.id}`,
      title: `🎂 ${emp.name}'s Birthday`,
      date: dateKey,
      employee: { 
        id: emp.id, 
        name: emp.name,
        department: emp.department,
        position: emp.position
      },
      type: 'birthday',
      color: '#FD8C02',
      allDay: true
    };
  });
  
  const anniversaries = mockEmployees
    .map(emp => {
      const joinDate = new Date(emp.joinDate);
      const month = joinDate.getUTCMonth();
      const day = joinDate.getUTCDate();
      const yearsOfService = currentYear - joinDate.getUTCFullYear();
      const dateKey = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      if (yearsOfService < 1) return null;
      
      return {
        id: `anniversary-${emp.id}`,
        title: `🏢 ${emp.name} - ${yearsOfService} Year${yearsOfService > 1 ? 's' : ''}`,
        date: dateKey,
        employee: { 
          id: emp.id, 
          name: emp.name,
          department: emp.department,
          position: emp.position
        },
        type: 'anniversary',
        color: '#9C2EDB',
        allDay: true,
        yearsOfService
      };
    })
    .filter(Boolean);
  
  return { birthdays, anniversaries };
}

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
