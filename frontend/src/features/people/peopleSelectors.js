export const selectPeopleList = (state) => state.people.peopleList;
export const selectPeopleLoading = (state) => state.people.loading;
export const selectPeopleError = (state) => state.people.error;
export const selectPeoplePage = (state) => state.people.currentPage;
export const selectPeopleCompanyFilter = (state) => state.people.companyFilter;

export default {
  selectPeopleList,
  selectPeopleLoading,
  selectPeopleError,
  selectPeoplePage,
  selectPeopleCompanyFilter,
};
