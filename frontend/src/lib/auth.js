/**
 * Get the current logged-in user's ID from localStorage.
 * Returns null if not logged in or user data is missing.
 */
export function getCurrentUserId() {
  if (typeof window === 'undefined') return null;
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.id ?? null;
  } catch {
    return null;
  }
}
