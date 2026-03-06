// formTemplatesAPI.js
import api from '@/services/api';

// Fetch form templates from backend (filtered by user's company via JWT)
export async function fetchFormTemplates() {
  const res = await api.get('/form-templates', {
    params: { sort: 'createdAt:desc' },
  });
  const data = Array.isArray(res?.data) ? res.data : [];
  return {
    templates: data,
    meta: res?.meta ?? {},
  };
}

// Fetch a single form template by documentId (filtered by user's company via JWT)
export async function fetchFormTemplateById(documentId) {
  const res = await api.get(`/form-templates/${documentId}`);
  return res?.data ?? null;
}
