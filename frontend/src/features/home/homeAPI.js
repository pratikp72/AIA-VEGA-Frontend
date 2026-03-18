import api from '@/services/api';
import API_ENDPOINTS from '@/services/endpoints';
import { USE_MOCK_DATA, mockDelay, MOCK_HOME_DATA } from '@/services/mockData';
import { getAvatarPropsForEmployee } from '@/lib/avatar';

export const fetchDashboardData = async () => {
  const rest = USE_MOCK_DATA
    ? await mockDelay().then(() => MOCK_HOME_DATA.dashboard)
    : await Promise.resolve(MOCK_HOME_DATA.dashboard);
  if (!USE_MOCK_DATA) {
    const results = await Promise.allSettled([
      fetchUpcomingEvents(),
      fetchNewJoinees(),
      fetchMyCourses(),
      fetchQuickLinks(),
      fetchBirthdaysToday(),
      fetchWorkAnniversaries(),
    ]);
    const [eventsRes, newJoineesRes, coursesRes, quickLinksRes, birthdaysRes, anniversariesRes] = results;

    const pickOrEmpty = (res, label) => {
      if (res.status === 'fulfilled') return Array.isArray(res.value) ? res.value : [];
      console.warn(`[home] ${label} fetch failed:`, res.reason?.message || res.reason);
      return [];
    };

    const events = pickOrEmpty(eventsRes, 'events');
    const newJoinees = pickOrEmpty(newJoineesRes, 'new joinees');
    const courses = pickOrEmpty(coursesRes, 'courses');
    const quickLinks = pickOrEmpty(quickLinksRes, 'quick links');
    const birthdays = pickOrEmpty(birthdaysRes, 'birthdays');
    const anniversaries = pickOrEmpty(anniversariesRes, 'anniversaries');

    return { ...rest, events, newJoinees, courses, quickLinks, birthdays, anniversaries };
  }
  return { ...rest };
};

export const fetchQuickLinks = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    return MOCK_HOME_DATA.quickLinks;
  }

  let response;
  try {
    response = await api.get('/important-links', {
      params: {
        'populate[link_icon]': true,
        sort: 'createdAt:desc',
      },
    });
  } catch {
    // Some custom endpoints may not accept sort - retry without it.
    response = await api.get('/important-links', {
      params: {
        'populate[link_icon]': true,
      },
    });
  }
  // The API returns { data: [...] }
  const links = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);

  const resolveIcon = (link) => {
    const icon = link?.link_icon ?? link?.icon ?? null;
    if (!icon) return null;

    if (typeof icon === 'string') {
      return { iconText: icon };
    }

    if (icon.iconData) {
      return {
        iconData: icon.iconData,
        width: icon.width,
        height: icon.height,
        iconName: icon.iconName,
      };
    }

    // Strapi media can be flattened or nested under data/attributes depending on API settings.
    const media = icon?.data?.attributes ?? icon?.data ?? icon;
    const mediaUrl = media?.formats?.large?.url || media?.formats?.medium?.url || media?.formats?.small?.url || media?.formats?.thumbnail?.url || media?.url;
    if (mediaUrl) {
      const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api').replace(/\/api\/?$/, '');
      return { iconUrl: mediaUrl.startsWith('http') ? mediaUrl : `${base}${mediaUrl.startsWith('/') ? mediaUrl : `/${mediaUrl}`}` };
    }

    return null;
  };

  // Map to expected frontend format if needed
  return links.map(link => ({
    id: link.id,
    documentId: link.documentId,
    title: link.title,
    url: link.url,
    icon: resolveIcon(link),
    active: link.active,
  }));
};

function formatTimeString(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return '';
  const period = h < 12 ? 'AM' : 'PM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

function normalizeEvent(item) {
  const start = item.start_date;
  const hasTime = item.time_required === true && !!item.start_time;
  const timeDisplay = hasTime
    ? `${formatTimeString(item.start_time)}${item.end_time ? ` – ${formatTimeString(item.end_time)}` : ''}`
    : '';
  return {
    id: item.documentId ?? item.id,
    documentId: item.documentId,
    title: item.title,
    description: item.description?.replace(/<[^>]+>/g, '') || '',
    date: start ? start.slice(0, 10) : '',
    time: timeDisplay,
    location: item.event_location || '',
    event_type: item.event_type,
    start_date: item.start_date,
    end_date: item.end_date,
  };
}

export const fetchUpcomingEvents = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(400);
    return MOCK_HOME_DATA.events;
  }

  let res;
  try {
    res = await api.get('/events', {
      params: { sort: 'start_date:desc' },
    });
  } catch {
    // Fallback for endpoints that don't support sort param.
    res = await api.get('/events');
  }
  const raw = Array.isArray(res?.data) ? res.data : [];
  const active = raw.filter((e) => e.active !== false);
  const forHome = active.filter((e) => [true, 1, '1', 'true'].includes(e.visible_on_homepage));
  const picked = (forHome.length > 0 ? forHome : active).sort((a, b) => {
    const aTime = new Date(a.start_date || 0).getTime();
    const bTime = new Date(b.start_date || 0).getTime();
    return bTime - aTime;
  });
  return picked.map(normalizeEvent);
};

const NEW_JOINEE_DAYS = 30;

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

function normalizeUserForJoinee(user) {
  const name = user.employee_name || user.username || 'Unknown';
  const avatar = getAvatarPropsForEmployee(user);
  return {
    id: user.id,
    documentId: user.documentId,
    name,
    email: user.email || '',
    phone: user.contact_no || '',
    position: user.designation || '',
    department: user.department || '',
    joinDate: user.joining_date || null,
    avatar: avatar.src,
    avatarInitial: avatar.initials,
  };
}

/** Check if joining_date is within the last N days (UTC-based to avoid timezone shift) */
function isNewJoinee(joiningDateStr, withinDays = NEW_JOINEE_DAYS) {
  if (!joiningDateStr) return false;
  const joinDate = new Date(joiningDateStr);
  const now = new Date();
  const joinUtc = Date.UTC(joinDate.getUTCFullYear(), joinDate.getUTCMonth(), joinDate.getUTCDate());
  const nowUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const daysSinceJoin = (nowUtc - joinUtc) / (1000 * 60 * 60 * 24);
  return daysSinceJoin >= 0 && daysSinceJoin <= withinDays;
}

export const fetchNewJoinees = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(400);
    const today = new Date();
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - NEW_JOINEE_DAYS);
    return MOCK_HOME_DATA.newJoinees
      .filter((j) => j.joinDate && new Date(j.joinDate) >= cutoff)
      .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
      .slice(0, 6);
  }

  const company = normalizeCompanyForFilter(getCurrentUserCompany());
  const response = await api.get(API_ENDPOINTS.ANALYTICS.EMPLOYEES, {
    params: {
      pageSize: 1000,
      ...(company && { company }),
    },
  });

  const items = response?.items || [];
  const newJoinees = items
    .filter((emp) => emp.joining_date && emp.blocked !== true && isNewJoinee(emp.joining_date, NEW_JOINEE_DAYS))
    .sort((a, b) => new Date(b.joining_date) - new Date(a.joining_date))
    .map(normalizeUserForJoinee);

  return newJoinees;
};

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api').replace(/\/api\/?$/, '');

function withImageUrl(imageObj) {
  if (!imageObj) return null;
  const url =
    imageObj.formats?.large?.url ||
    imageObj.formats?.medium?.url ||
    imageObj.formats?.small?.url ||
    imageObj.formats?.thumbnail?.url ||
    imageObj.url;
  if (!url) return null;
  return url.startsWith('http') ? url : BASE_URL + (url.startsWith('/') ? url : `/${url}`);
}

function getCurrentUserId() {
  if (typeof window === 'undefined') return null;
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.id ?? null;
  } catch {
    return null;
  }
}

function getCurrentUserInfo() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

/**
 * Fetch all active course-assignments and build a map of courseId → earliest due_date.
 * Filters only assignments that apply to the current user (by company, department,
 * work_location, or individual user id).
 */
async function fetchCourseDueDateMap() {
  const user = getCurrentUserInfo();
  const userId = user?.id ?? null;
  const userDept = String(user?.department ?? '').trim().toLowerCase();
  const userWorkLocation = String(user?.work_location ?? user?.work_location_id ?? '').trim().toLowerCase();

  let assignments = [];
  try {
    const res = await api.get('/course-assignments', {
      params: {
        'populate[courses]': true,
        'populate[departments]': true,
        'populate[individual_user]': true,
        'populate[work_locations]': true,
        'filters[active][$eq]': true,
        'pagination[pageSize]': 1000,
        'pagination[page]': 1,
      },
    });
    assignments = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
  } catch {
    return {};
  }

  const dueDateMap = {};

  for (const assignment of assignments) {
    const dueDate = assignment.due_date;
    if (!dueDate) continue;

    const targetType = assignment.assignment_target_type;
    let applicable = false;

    if (targetType === 'Department') {
      const names = (Array.isArray(assignment.departments) ? assignment.departments : [])
        .map(d => String(d?.name ?? d?.title ?? '').trim().toLowerCase());
      applicable = userDept && names.some(n => n === userDept || n.includes(userDept) || userDept.includes(n));
    } else if (targetType === 'Individual') {
      const users = Array.isArray(assignment.individual_user) ? assignment.individual_user : [];
      applicable = userId != null && users.some(u => String(u?.id) === String(userId) || String(u?.documentId) === String(userId));
    } else if (targetType === 'Location') {
      const names = (Array.isArray(assignment.work_locations) ? assignment.work_locations : [])
        .map(l => String(l?.name ?? l?.title ?? l?.id ?? '').trim().toLowerCase());
      applicable = userWorkLocation && names.some(n => n === userWorkLocation || n.includes(userWorkLocation) || userWorkLocation.includes(n));
    }

    if (!applicable) continue;

    const courses = Array.isArray(assignment.courses) ? assignment.courses : [];
    for (const course of courses) {
      const cid = course?.id;
      if (!cid) continue;
      // Keep the earliest due_date per course
      if (!dueDateMap[cid] || new Date(dueDate) < new Date(dueDateMap[cid])) {
        dueDateMap[cid] = dueDate;
      }
    }
  }

  return dueDateMap;
}

export const fetchMyCourses = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(500);
    return MOCK_HOME_DATA.courses;
  }
  const userId = getCurrentUserId();

  // Two parallel calls: courses list + all user progress (replaces N+1 pattern)
  const [response, allProgressRes] = await Promise.allSettled([
    api.get(API_ENDPOINTS.COURSES.LIST, {
      params: {
        'populate[thumbnail]': true,
        'populate[modules]': true,
        sort: 'createdAt:desc',
      },
    }),
    userId
      ? api.get('/user-progress/all', { params: { userId } })
      : Promise.resolve(null),
  ]);

  const raw = response.status === 'fulfilled'
    ? (Array.isArray(response.value?.data) ? response.value.data : (Array.isArray(response.value) ? response.value : []))
    : [];
  const courses = raw.filter(c => c.active !== false).slice(0, 4);

  // Build a map of courseId -> completed_modules array from the batch progress response
  const progressMap = {};
  if (allProgressRes.status === 'fulfilled' && allProgressRes.value) {
    const progressData = allProgressRes.value?.data ?? allProgressRes.value;
    const progressList = Array.isArray(progressData) ? progressData : [];
    for (const entry of progressList) {
      const cId = entry?.course?.id ?? entry?.courseId ?? entry?.course_id;
      if (cId != null) {
        progressMap[String(cId)] = Array.isArray(entry.completed_modules)
          ? entry.completed_modules.map(String)
          : [];
      }
    }
  }

  return courses.map((c) => {
    const totalLessons = Array.isArray(c.modules) ? c.modules.length : 0;
    const courseId = c.id ?? c.documentId;
    const completed = progressMap[String(courseId)] ?? [];
    const courseModules = Array.isArray(c.modules) ? c.modules : [];
    const completedLessons = courseModules.filter(m =>
      completed.includes(String(m.id)) || (m.module_id && completed.includes(String(m.module_id)))
    ).length;
    const progress = totalLessons > 0 ? Math.min(100, Math.round((completedLessons / totalLessons) * 100)) : 0;
    return {
      id: c.id,
      documentId: c.documentId,
      title: c.title || '',
      category: c.course_category || 'courses',
      thumbnail: withImageUrl(c.thumbnail),
      progress,
      completedLessons,
      totalLessons,
      deadline: c.deadline || '2026-12-31',
    };
  });
};


export const fetchBirthdaysToday = async () => {
  // Fetch all users
  const response = await api.get(API_ENDPOINTS.USERS.LIST, {
    params: {
      'populate[photograph]': true,
      sort: 'username:asc',
    },
  });
  const users = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDate = today.getDate();
  // Filter users whose date_of_birth matches today (ignore year)
  return users
    .filter(u => {
      if (!u.date_of_birth) return false;
      const [year, month, day] = u.date_of_birth.split('-').map(Number);
      return month === todayMonth && day === todayDate;
    })
    .map(u => {
      const avatar = getAvatarPropsForEmployee(u);
      return {
        id: u.id,
        name: u.employee_name || u.username || 'Unknown',
        position: u.designation || '',
        department: u.department || '',
        avatar: avatar.src,
        avatarInitial: avatar.initials,
        date: u.date_of_birth,
      };
    });
};


export const fetchWorkAnniversaries = async () => {
  // Fetch all users
  const response = await api.get(API_ENDPOINTS.USERS.LIST, {
    params: {
      'populate[photograph]': true,
      sort: 'username:asc',
    },
  });
  const users = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDate = today.getDate();
  // Filter users whose joining_date matches today (ignore year)
  return users
    .filter(u => {
      if (!u.joining_date) return false;
      const [year, month, day] = u.joining_date.split('-').map(Number);
      return month === todayMonth && day === todayDate;
    })
    .map(u => {
      const [year, month, day] = u.joining_date.split('-').map(Number);
      const yearsCompleted = today.getFullYear() - year;
      const avatar = getAvatarPropsForEmployee(u);
      return {
        id: u.id,
        name: u.username || 'Unknown',
        position: u.designation || '',
        department: u.department || '',
        avatar: avatar.src,
        avatarInitial: avatar.initials,
        yearsCompleted,
        joinDate: u.joining_date,
      };
    });
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