// Selectors for Home feature (news carousel shows only homepage-visible news)
const isPublishedNewsItem = (item) => {
  const publishValue =
    item?.publish_date ??
    item?.publishDate ??
    item?.published_at ??
    item?.publishedAt ??
    item?.date;

  if (!publishValue) return true;

  const raw = String(publishValue).trim();
  const dateOnlyMatch = raw.match(/^\d{4}-\d{2}-\d{2}$/);
  if (dateOnlyMatch) {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return raw <= today;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return true;
  return parsed <= new Date();
};

export const selectNewsCarousel = (state) => {
  const list = state.news?.newsList ?? [];
  return list.filter(
    (n) =>
      n.active !== false &&
      (n.visible_on_homepage === true || n.visible_on_homepage === 1) &&
      isPublishedNewsItem(n)
  );
};
export const selectQuickLinks = (state) => state.home.quickLinks;
export const selectUpcomingEvents = (state) => state.home.upcomingEvents;
export const selectNewJoinees = (state) => state.home.newJoinees;
export const selectMyCourses = (state) => state.home.myCourses;
export const selectBirthdaysToday = (state) => state.home.birthdaysToday;
export const selectWorkAnniversaries = (state) => state.home.workAnniversaries;

export const selectHomeLoading = (state) => state.home.loading;
export const selectHomeError = (state) => state.home.error;

export const selectIsDashboardLoading = (state) => state.home.loading.dashboard;
export const selectIsNewsLoading = (state) => state.news?.loading ?? false;
export const selectIsEventsLoading = (state) => state.home.loading.events;

export default {
  selectNewsCarousel,
  selectQuickLinks,
  selectUpcomingEvents,
  selectNewJoinees,
  selectMyCourses,
  selectBirthdaysToday,
  selectWorkAnniversaries,
  selectHomeLoading,
  selectHomeError,
  selectIsDashboardLoading,
};