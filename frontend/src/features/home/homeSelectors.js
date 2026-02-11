// Selectors for Home feature
export const selectNewsCarousel = (state) => state.home.newsCarousel;
export const selectQuickLinks = (state) => state.home.quickLinks;
export const selectUpcomingEvents = (state) => state.home.upcomingEvents;
export const selectNewJoinees = (state) => state.home.newJoinees;
export const selectMyCourses = (state) => state.home.myCourses;
export const selectBirthdaysToday = (state) => state.home.birthdaysToday;
export const selectWorkAnniversaries = (state) => state.home.workAnniversaries;

export const selectHomeLoading = (state) => state.home.loading;
export const selectHomeError = (state) => state.home.error;

export const selectIsDashboardLoading = (state) => state.home.loading.dashboard;
export const selectIsNewsLoading = (state) => state.home.loading.news;
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