// formTemplatesAPI.js

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

// Fetch form templates from backend (populate media for PDF/Excel/Word file URLs)
export async function fetchFormTemplates() {
  const url = `${API_BASE}/api/form-templates?populate[0]=form_pdf&populate[1]=form_excel&populate[2]=form_word`;
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

// Fetch a single form template by documentId (populate media for file URLs)
export async function fetchFormTemplateById(documentId) {
  const url = `${API_BASE}/api/form-templates/${documentId}?populate[0]=form_pdf&populate[1]=form_excel&populate[2]=form_word`;
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
