export const selectCalendarEvents = (state) => state.calendar?.events || [];
export const selectCalendarLoading = (state) => state.calendar?.loading || false;
export const selectCalendarError = (state) => state.calendar?.error || null;
