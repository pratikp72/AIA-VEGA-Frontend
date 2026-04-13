export const selectNewsList = (state) => state.news.newsList;
export const selectCurrentCategory = (state) => state.news.currentCategory;
export const selectCurrentPage = (state) => state.news.currentPage;
export const selectTotalPages = (state) => state.news.totalPages;
export const selectTotalCount = (state) => state.news.totalCount;
export const selectNewsLoading = (state) => state.news.loading;
export const selectNewsError = (state) => state.news.error;

export default {
  selectNewsList,
  selectCurrentCategory,
  selectCurrentPage,
  selectTotalPages,
  selectTotalCount,
  selectNewsLoading,
  selectNewsError,
};