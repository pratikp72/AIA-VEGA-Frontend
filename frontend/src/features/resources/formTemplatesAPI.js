// formTemplatesAPI.js
import api from '@/services/api';

// Fetch form templates from backend (filtered by user's company via JWT)
export async function fetchFormTemplates({ page = 1, limit = 10, search = '', date = '' } = {}) {
  const res = await api.get('/form-templates', {
    params: {
      sort: 'createdAt:desc',
      page,
      pageSize: limit,
      ...(search ? { search } : {}),
      ...(date ? { date } : {}),
    },
  });
  const data = Array.isArray(res?.data) ? res.data : [];
  const pagination = res?.meta?.pagination || {};
  return {
    templates: data,
    meta: {
      ...res?.meta,
      pagination: {
        page: pagination.page || page,
        pageSize: pagination.pageSize || limit,
        pageCount: pagination.pageCount || 1,
        total: pagination.total || data.length,
      },
    },
  };
}

// Fetch a single form template by documentId (filtered by user's company via JWT)
export async function fetchFormTemplateById(documentId) {
  const res = await api.get(`/form-templates/${documentId}`);
  return res?.data ?? null;
}
