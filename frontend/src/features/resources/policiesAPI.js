// policiesAPI.js
import api from '@/services/api';

// Fetch company policies from backend (filtered by user's company via JWT)
export async function fetchPolicies() {
  const res = await api.get('/company-policies');
  const data = Array.isArray(res?.data) ? res.data : [];
  return {
    policies: data,
    totalPages: 1,
    totalItems: data.length,
    currentPage: 1,
  };
}

// Fetch a single policy by documentId (filtered by user's company via JWT)
export async function fetchPolicyById(documentId) {
  const res = await api.get(`/company-policies/${documentId}`);
  return res?.data ?? null;
}