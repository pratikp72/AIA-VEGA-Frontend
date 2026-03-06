import { getAvatarPropsForEmployee } from '@/lib/avatar';

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
  const { src, initials } = getAvatarPropsForEmployee(user || {});
  return { src: src || '', initials: initials || '—' };
}
