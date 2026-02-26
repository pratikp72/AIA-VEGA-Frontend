/**
 * News API – only API calls (Axios). No Redux.
 * Slice (newsSlice) uses these and updates the store.
 */
import api from '@/services/api';
import { USE_MOCK_DATA, mockDelay, MOCK_NEWS_DATA } from '@/services/mockData';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

// Helpers: normalize Strapi v4 response (unwrap media, resolve image URL)
function unwrapMedia(attrs) {
  if (!attrs) return attrs;
  const cov = attrs.cover_image;
  if (!cov) return attrs;
  const data = cov.data;
  if (data == null) return { ...attrs, cover_image: null };
  const mediaAttrs = Array.isArray(data) ? data[0]?.attributes : data?.attributes;
  return mediaAttrs ? { ...attrs, cover_image: mediaAttrs } : attrs;
}

function withImageUrl(item, preferSize = 'medium') {
  if (!item) return item;
  const cov = item.cover_image;
  const url = cov?.formats?.[preferSize]?.url || cov?.url;
  const imageUrl = url
    ? url.startsWith('http')
      ? url
      : BASE_URL + (url.startsWith('/') ? url : `/${url}`)
    : null;
  return { ...item, imageUrl };
}

function normalizeItem(item) {
  const { id, attributes } = item;
  const flat = attributes ? { id, ...unwrapMedia(attributes) } : item;
  return withImageUrl(flat, 'small');
}

function normalizeDetail(item) {
  const { id, attributes } = item;
  const flat = attributes ? { id, ...unwrapMedia(attributes) } : item;
  return withImageUrl(flat, 'medium');
}

// 3. Clean API calls (no pagination)
async function fetchNewsInternal(params = {}) {
  const res = await api.get('/news-items', {
    params: { populate: '*', ...params },
  });
  const raw = Array.isArray(res?.data) ? res.data : [];
  const news = raw.map(normalizeItem);
  return { news };
}


export async function fetchAllNews() {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return { news: MOCK_NEWS_DATA.filter(item => item.visible_on_homepage).map((item) => withImageUrl(item)) };
  }
  // Fetch from API and filter for visible_on_homepage
  const res = await api.get('/news-items', { params: { populate: '*' } });
  const raw = Array.isArray(res?.data) ? res.data : [];
  // If API returns { data: [...] }, use res.data
  const filtered = raw.filter(item => item.visible_on_homepage === true || item.visible_on_homepage === 1);
  return { news: filtered.map(normalizeItem) };
}


export async function fetchNewsByCategory(category) {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    const filtered =
      category === 'all'
        ? MOCK_NEWS_DATA
        : MOCK_NEWS_DATA.filter(
            (n) => n.category?.toLowerCase() === category.toLowerCase()
          );
    return { news: filtered.map((item) => withImageUrl(item)) };
  }
  const params = category !== 'all' ? { 'filters[category][$eq]': category } : {};
  return fetchNewsInternal(params);
}

export async function fetchNewsById(id) {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    const found = MOCK_NEWS_DATA.find((n) => n.id === parseInt(id, 10));
    return found ? withImageUrl(found, 'medium') : null;
  }

  const res = await api.get(`/news-items/${id}`, {
    params: { populate: '*' },
  });
  const data = res?.data;
  if (!data) return null;
  return normalizeDetail(data);
}

export default {
  fetchAllNews,
  fetchNewsByCategory,
  fetchNewsById,
};