export const selectNewsList = (state) => state.news.filteredNews;
export const selectCurrentCategory = (state) => state.news.currentCategory;
export const selectCurrentPage = (state) => state.news.currentPage;
export const selectTotalPages = (state) => state.news.totalPages;
export const selectTotalItems = (state) => state.news.totalItems;
export const selectNewsLoading = (state) => state.news.loading;
export const selectNewsError = (state) => state.news.error;

export default {
  selectNewsList,
  selectCurrentCategory,
  selectCurrentPage,
  selectTotalPages,
  selectTotalItems,
  selectNewsLoading,
  selectNewsError,
};