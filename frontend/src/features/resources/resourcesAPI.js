import { USE_MOCK_DATA, mockDelay, MOCK_RESOURCES } from '@/services/mockData';

// Fetch paginated resources (mock-friendly)
export async function fetchResources(page = 1, limit = 10) {
  if (USE_MOCK_DATA) {
    await mockDelay(200);
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      resources: MOCK_RESOURCES.slice(start, end),
      totalPages: Math.max(1, Math.ceil(MOCK_RESOURCES.length / limit)),
      totalItems: MOCK_RESOURCES.length,
      currentPage: page,
    };
  }

  // Placeholder for real API call
  return {
    resources: MOCK_RESOURCES,
    totalPages: 1,
    totalItems: MOCK_RESOURCES.length,
    currentPage: page,
  };
}

export default { fetchResources };
