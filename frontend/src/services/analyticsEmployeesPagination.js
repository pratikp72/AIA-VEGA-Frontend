const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_CONCURRENCY = 4;

function chunkArray(values, size) {
  const out = [];
  for (let i = 0; i < values.length; i += size) {
    out.push(values.slice(i, i + size));
  }
  return out;
}

/**
 * Fetches all pages from /analytics/employees with bounded concurrency.
 * Keeps page-size within backend cap and deduplicates by id.
 */
export async function fetchAllAnalyticsEmployees(apiClient, endpoint, baseParams = {}, options = {}) {
  const pageSize = Math.min(DEFAULT_PAGE_SIZE, Math.max(1, Number(options.pageSize) || DEFAULT_PAGE_SIZE));
  const concurrency = Math.max(1, Number(options.concurrency) || DEFAULT_CONCURRENCY);

  const firstPage = await apiClient.get(endpoint, {
    params: { ...baseParams, page: 1, pageSize },
  });

  const firstItems = firstPage?.items || [];
  const totalPages = Math.max(1, Number(firstPage?.totalPages) || 1);

  let allItems = [...firstItems];
  if (totalPages > 1) {
    const pageNumbers = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
    const groups = chunkArray(pageNumbers, concurrency);

    for (const group of groups) {
      const pageResponses = await Promise.all(
        group.map((page) => apiClient.get(endpoint, { params: { ...baseParams, page, pageSize } }))
      );
      for (const res of pageResponses) {
        allItems = allItems.concat(res?.items || []);
      }
    }
  }

  const seen = new Set();
  const deduped = [];
  for (const item of allItems) {
    const key = item?.id;
    if (key == null) {
      deduped.push(item);
      continue;
    }
    const keyStr = String(key);
    if (seen.has(keyStr)) continue;
    seen.add(keyStr);
    deduped.push(item);
  }

  return deduped;
}
