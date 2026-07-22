export const selectSocialMediaList = (state) => state.socialMedia?.list ?? [];
export const selectSocialMediaLoading = (state) => state.socialMedia?.loading ?? false;
export const selectSocialMediaError = (state) => state.socialMedia?.error ?? null;
export const selectSocialMediaCurrentPage = (state) => state.socialMedia?.currentPage ?? 1;
export const selectSocialMediaTotalPages = (state) => state.socialMedia?.totalPages ?? 1;
export const selectSocialMediaTotalCount = (state) => state.socialMedia?.totalCount ?? 0;
