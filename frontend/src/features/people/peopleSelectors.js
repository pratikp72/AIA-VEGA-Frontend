export const selectPeopleList = (state) => state.people.peopleList;
export const selectPeopleLoading = (state) => state.people.loading;
export const selectPeopleError = (state) => state.people.error;
export const selectPeoplePage = (state) => state.people.currentPage;
export const selectPeopleTotalPages = (state) => state.people.totalPages;
export const selectPeopleTotalCount = (state) => state.people.totalCount;
export const selectPeopleCompanyFilter = (state) => state.people.companyFilter;
export const selectPeopleDepartmentOptions = (state) => state.people.departmentOptions;
export const selectPeopleLocationOptions = (state) => state.people.locationOptions;

export default {
  selectPeopleList,
  selectPeopleLoading,
  selectPeopleError,
  selectPeoplePage,
  selectPeopleTotalPages,
  selectPeopleTotalCount,
  selectPeopleCompanyFilter,
  selectPeopleDepartmentOptions,
  selectPeopleLocationOptions,
};
