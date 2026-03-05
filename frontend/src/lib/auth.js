const DICEBEAR_AVATAR_BASE = 'https://api.dicebear.com/7.x/avataaars/svg';

/**
 * Get the current logged-in user from localStorage.
 * Returns null if not logged in or user data is missing.
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user && (user.id != null || user.documentId != null || user.username) ? user : null;
  } catch {
    return null;
  }
}

/**
 * Get the current logged-in user's ID from localStorage.
 * Returns null if not logged in or user data is missing.
 */
export function getCurrentUserId() {
  const user = getCurrentUser();
  return user?.id ?? user?.documentId ?? null;
}

/**
 * Avatar props derived from user so profile page and top header show the same image.
 * @param {object|null} user - User object (e.g. from getCurrentUser())
 * @returns {{ src: string, initials: string }}
 */
export function getAvatarPropsForUser(user) {
  const name = user?.employee_name || user?.username || user?.name || '';
  const seed = (name || user?.id || user?.email || 'default').toString().trim() || 'default';
  const initials = name
    ? name.split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase()
    : (user?.email?.[0] || '?').toUpperCase();
  return {
    src: `${DICEBEAR_AVATAR_BASE}?seed=${encodeURIComponent(seed)}`,
    initials: initials || '—',
  };
}
