// Selectors for Home feature (news carousel shows only homepage-visible news)
export const selectNewsCarousel = (state) => {
  const list = state.news?.newsList ?? [];
  return list.filter(
    (n) => n.visible_on_homepage === true || n.visible_on_homepage === 1
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