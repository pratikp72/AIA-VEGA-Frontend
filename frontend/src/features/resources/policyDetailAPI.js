// Fetch a single company policy by documentId
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

export default { fetchPolicyById };