export const selectResourcesList = (state) => state.resources.resourcesList;
export const selectResourcesLoading = (state) => state.resources.loading;
export const selectResourcesError = (state) => state.resources.error;
export const selectCurrentPage = (state) => state.resources.currentPage;
export const selectTotalPages = (state) => state.resources.totalPages;
export const selectTotalItems = (state) => state.resources.totalItems;

export default {
  selectResourcesList,
  selectResourcesLoading,
  selectResourcesError,
};
