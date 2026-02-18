export const selectCourseCategories = (state) => state.courses.categories;
export const selectCoursesLoading = (state) => state.courses.loading;
export const selectCoursesError = (state) => state.courses.error;

export default {
  selectCourseCategories,
  selectCoursesLoading,
  selectCoursesError,
};
