// formTemplatesSelectors.js

export const selectFormTemplatesList = (state) => state.formTemplates.templatesList;
export const selectFormTemplatesMeta = (state) => state.formTemplates.meta;
export const selectFormTemplateDetail = (state) => state.formTemplates.templateDetail;
export const selectFormTemplatesLoading = (state) => state.formTemplates.loading;
export const selectFormTemplatesError = (state) => state.formTemplates.error;
export const selectFormTemplatesCurrentPage = (state) => state.formTemplates.currentPage;
export const selectFormTemplatesTotalPages = (state) => state.formTemplates.totalPages;
export const selectFormTemplatesTotalItems = (state) => state.formTemplates.totalItems;
