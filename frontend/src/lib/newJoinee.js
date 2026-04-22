/**
 * Single definition of "new joinee" for home + people (must match analytics dateFrom window).
 * Uses UTC calendar days so boundary cases (e.g. exactly 30 days) match the home widget,
 * unlike raw millisecond diff from Date which can exceed 30.0 due to time-of-day.
 */
export const NEW_JOINEE_DAYS = 30;

/**
 * @param {string} joiningDateStr - ISO date string (e.g. from API `joining_date`)
 * @param {number} [withinDays]
 * @returns {boolean}
 */
export function isNewJoinee(joiningDateStr, withinDays = NEW_JOINEE_DAYS) {
  if (!joiningDateStr) return false;
  const joinDate = new Date(joiningDateStr);
  if (Number.isNaN(joinDate.getTime())) return false;
  const now = new Date();
  const joinUtc = Date.UTC(joinDate.getUTCFullYear(), joinDate.getUTCMonth(), joinDate.getUTCDate());
  const nowUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const daysSinceJoin = (nowUtc - joinUtc) / (1000 * 60 * 60 * 24);
  return daysSinceJoin >= 0 && daysSinceJoin <= withinDays;
}
