export const selectPoliciesList = (state) => state.policies.policiesList;
export const selectPoliciesLoading = (state) => state.policies.loading;
export const selectPoliciesError = (state) => state.policies.error;
export const selectPoliciesCurrentPage = (state) => state.policies.currentPage;
export const selectPoliciesTotalPages = (state) => state.policies.totalPages;
export const selectPoliciesTotalItems = (state) => state.policies.totalItems;

export default {
  selectPoliciesList,
  selectPoliciesLoading,
  selectPoliciesError,
  selectPoliciesCurrentPage,
  selectPoliciesTotalPages,
  selectPoliciesTotalItems,
};
