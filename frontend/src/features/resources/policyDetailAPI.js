// Fetch a single company policy by documentId
export async function fetchPolicyById(documentId) {
  const url = `http://localhost:1337/api/company-policies/${documentId}`;
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiaWF0IjoxNzcxODMxNDYxLCJleHAiOjE3NzQ0MjM0NjF9.AWc1VDjXN8B1WZXjZ2HTdWB27sqH7T5OvBO972cTB1I';
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch policy');
  const json = await res.json();
  return json.data;
}

export default { fetchPolicyById };