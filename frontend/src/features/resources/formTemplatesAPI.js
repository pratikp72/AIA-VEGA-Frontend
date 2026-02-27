// formTemplatesAPI.js

// Fetch form templates from backend
export async function fetchFormTemplates() {
  const url = `http://localhost:1337/api/form-templates`;
  const getToken = () => localStorage.getItem('authToken') || '';
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch form templates');
  const json = await res.json();
  return {
    templates: json.data,
    meta: json.meta,
  };
}

// Fetch a single form template by documentId
export async function fetchFormTemplateById(documentId) {
  const url = `http://localhost:1337/api/form-templates/${documentId}`;
const getToken = () => localStorage.getItem('authToken') || '';
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch form template');
  const json = await res.json();
  return json.data;
}
