export const selectCoursesList = (state) => state.courses.coursesList;
export const selectCoursesLoading = (state) => state.courses.loading;
export const selectCoursesError = (state) => state.courses.error;
export const selectCurrentCourse = (state) => state.courses.currentCourse;
export const selectCourseDetailLoading = (state) => state.courses.courseDetailLoading;
export const selectCourseDetailError = (state) => state.courses.courseDetailError;

// Alias for backwards compatibility
export const selectCourseCategories = selectCoursesList;

export default {
  selectCoursesList,
  selectCourseCategories,
  selectCoursesLoading,
  selectCoursesError,
  selectCurrentCourse,
  selectCourseDetailLoading,
  selectCourseDetailError,
};
