import api from '@/services/api';

// Fetch a single company policy by documentId.
// Uses shared API client so env base URL + auth handling are consistent.
export async function fetchPolicyById(documentId) {
  const res = await api.get(`/company-policies/${documentId}`);
  return res?.data ?? null;
}

export default { fetchPolicyById };