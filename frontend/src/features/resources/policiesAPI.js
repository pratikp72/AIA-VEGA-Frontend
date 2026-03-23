// policiesAPI.js
import api from '@/services/api';

// Fetch company policies from backend (filtered by user's company via JWT)
export async function fetchPolicies({ page = 1, limit = 10, search = '', date = '' } = {}) {
  const res = await api.get('/company-policies', {
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
    policies: data,
    totalPages: pagination.pageCount || 1,
    totalItems: pagination.total || data.length,
    currentPage: pagination.page || page,
  };
}

// Fetch a single policy by documentId (filtered by user's company via JWT)
export async function fetchPolicyById(documentId) {
  const res = await api.get(`/company-policies/${documentId}`);
  return res?.data ?? null;
}