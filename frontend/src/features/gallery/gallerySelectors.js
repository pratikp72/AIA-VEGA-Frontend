export const selectGalleryItems = (state) => state.gallery.items;
export const selectGalleryLoading = (state) => state.gallery.loading;
export const selectGalleryError = (state) => state.gallery.error;
export const selectGalleryCurrentPage = (state) => state.gallery.currentPage;
export const selectGalleryTotalPages = (state) => state.gallery.totalPages;
export const selectGalleryTotalItems = (state) => state.gallery.totalItems;
export const selectGalleryCompanyFilter = (state) => state.gallery.companyFilter;

export default {
  selectGalleryItems,
  selectGalleryLoading,
  selectGalleryError,
  selectGalleryCurrentPage,
  selectGalleryTotalPages,
  selectGalleryTotalItems,
  selectGalleryCompanyFilter,
};
