// formTemplatesAPI.js

// Fetch form templates from backend
export async function fetchFormTemplates() {
  const url = `http://localhost:1337/api/form-templates`;
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiaWF0IjoxNzcxODMxNDYxLCJleHAiOjE3NzQ0MjM0NjF9.AWc1VDjXN8B1WZXjZ2HTdWB27sqH7T5OvBO972cTB1I';
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
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
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiaWF0IjoxNzcxODMxNDYxLCJleHAiOjE3NzQ0MjM0NjF9.AWc1VDjXN8B1WZXjZ2HTdWB27sqH7T5OvBO972cTB1I';
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch form template');
  const json = await res.json();
  return json.data;
}
