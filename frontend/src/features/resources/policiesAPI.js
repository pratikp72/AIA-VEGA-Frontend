// policiesAPI.js


// Fetch company policies from backend
export async function fetchPolicies() {
  const url = `http://localhost:1337/api/company-policies`;
  const getToken = () => localStorage.getItem('authToken') || '';
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch policies');
  const json = await res.json();
  return {
    policies: json.data,
    totalPages: 1,
    totalItems: Array.isArray(json.data) ? json.data.length : 0,
    currentPage: 1,
  };
}

// Fetch a single policy by documentId
export async function fetchPolicyById(documentId) {
  const url = `http://localhost:1337/api/company-policies/${documentId}`;
  const getToken = () => localStorage.getItem('authToken') || '';
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch policy');
  const json = await res.json();
  return json.data;
}