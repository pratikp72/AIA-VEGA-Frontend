import api from '@/services/api';
import API_ENDPOINTS from '@/services/endpoints';
import { USE_MOCK_DATA, mockDelay, MOCK_HOME_DATA } from '@/services/mockData';
import { getAvatarPropsForEmployee } from '@/lib/avatar';

export const fetchDashboardData = async () => {
  const rest = USE_MOCK_DATA
    ? await mockDelay().then(() => MOCK_HOME_DATA.dashboard)
    : await Promise.resolve(MOCK_HOME_DATA.dashboard);
  if (!USE_MOCK_DATA) {
    const [events, newJoinees, courses, quickLinks, birthdays, anniversaries] = await Promise.all([
      fetchUpcomingEvents(),
      fetchNewJoinees(),
      fetchMyCourses(),
      fetchQuickLinks(),
      fetchBirthdaysToday(),
      fetchWorkAnniversaries(),
    ]);
    return { ...rest, events, newJoinees, courses, quickLinks, birthdays, anniversaries };
  }
  return { ...rest };
};

export const fetchQuickLinks = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    return MOCK_HOME_DATA.quickLinks;
  }

  const response = await api.get('/important-links', {
    params: {
      'populate[link_icon]': true,
    },
  });
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

function formatEventTime(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function normalizeEvent(item) {
  const start = item.start_date;
  return {
    id: item.documentId ?? item.id,
    documentId: item.documentId,
    title: item.title,
    description: item.description?.replace(/<[^>]+>/g, '') || '',
    date: start ? new Date(start).toISOString().slice(0, 10) : '',
    time: formatEventTime(start),
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

  const res = await api.get('/events');
  const raw = Array.isArray(res?.data) ? res.data : [];
  const forHome = raw.filter((e) => e.active !== false && e.visible_on_homepage === true);
  return forHome.map(normalizeEvent);
};

function normalizeUser(user) {
  const name = user.username || 'Unknown';
  const joinDate = user.joining_date || null;
  const now = new Date();
  const isNew = joinDate
    ? (now - new Date(joinDate)) / (1000 * 60 * 60 * 24) <= 30
    : false;
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
    location: user.working_location || '',
    joinDate,
    company: user.company || '',
    avatar: avatar.src,
    avatarInitial: avatar.initials,
    isNew,
  };
}

export const fetchNewJoinees = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(400);
    return MOCK_HOME_DATA.newJoinees;
  }
  const response = await api.get(API_ENDPOINTS.USERS.LIST, {
    params: {
      'populate[photograph]': true,
    },
  });
  const raw = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
  const users = raw.map(normalizeUser);
  const sorted = users
    .filter(u => u.joinDate)
    .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));
  return sorted.slice(0, 4);
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

export const fetchMyCourses = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(500);
    return MOCK_HOME_DATA.courses;
  }
  const response = await api.get(API_ENDPOINTS.COURSES.LIST, {
    params: {
      'populate[thumbnail]': true,
      'populate[modules]': true,
    },
  });
  const raw = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
  const courses = raw.filter(c => c.active !== false).slice(0, 4);
  const userId = getCurrentUserId();

  const withProgress = await Promise.all(
    courses.map(async (c) => {
      const totalLessons = Array.isArray(c.modules) ? c.modules.length : 0;
      let completedLessons = 0;
      let progress = 0;
      const courseId = c.id ?? c.documentId;
      if (userId && courseId) {
        try {
          const progRes = await api.get('/user-progress/progress', {
            params: { userId, courseId },
          });
          const data = progRes?.data ?? progRes;
          const completed = Array.isArray(data?.completed_modules) ? data.completed_modules.map(String) : [];
          // Count only unique course modules that have a matching entry in completed_modules.
          // completed_modules may contain both numeric ids ("261") and string moduleIds
          // ("mod-1772...") for the same module — count each physical module once.
          const courseModules = Array.isArray(c.modules) ? c.modules : [];
          completedLessons = courseModules.filter(m =>
            completed.includes(String(m.id)) || (m.module_id && completed.includes(String(m.module_id)))
          ).length;
          progress = totalLessons > 0 ? Math.min(100, Math.round((completedLessons / totalLessons) * 100)) : 0;
        } catch {
          // keep 0
        }
      }
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
    })
  );

  return withProgress;
};


export const fetchBirthdaysToday = async () => {
  // Fetch all users
  const response = await api.get(API_ENDPOINTS.USERS.LIST, {
    params: {
      'populate[photograph]': true,
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