/**
 * Social Media API – Strapi collection `social-medias`.
 */
import api from '@/services/api';

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337').replace(/\/api\/?$/, '');

function unwrapMedia(attrs) {
  if (!attrs) return attrs;
  const cov = attrs.cover_image;
  if (!cov) return attrs;
  const data = cov?.data;
  if (data == null) return { ...attrs, cover_image: cov };
  const first = Array.isArray(data) ? data[0] : data;
  const mediaAttrs = first?.attributes || first;
  return mediaAttrs ? { ...attrs, cover_image: mediaAttrs } : { ...attrs, cover_image: cov };
}

function withImageUrl(item, preferSize = 'medium') {
  if (!item) return item;
  const cov = item.cover_image;
  const formats = cov?.formats ?? cov?.data?.formats ?? cov?.attributes?.formats;
  const rawUrl =
    formats?.[preferSize]?.url ||
    formats?.small?.url ||
    formats?.thumbnail?.url ||
    cov?.url ||
    cov?.data?.url ||
    cov?.attributes?.url ||
    item?.imageUrl;
  const url = typeof rawUrl === 'string' ? rawUrl : null;
  const imageUrl = url
    ? url.startsWith('http')
      ? url
      : BASE_URL + (url.startsWith('/') ? url : `/${url}`)
    : null;
  return { ...item, imageUrl };
}

function toFlat(item) {
  if (!item) return item;
  if (item.attributes) return { id: item.id, ...unwrapMedia(item.attributes) };
  return unwrapMedia(item);
}

function normalizeItem(item) {
  return withImageUrl(toFlat(item), 'small');
}

/** Fetch social media entries (paginated). Optional title / short-description search. */
export async function fetchSocialMedias({ page = 1, pageSize = 24, search = '' } = {}) {
  // Default Strapi REST uses pagination[page] / pagination[pageSize] (not flat page/pageSize)
  const params = {
    populate: '*',
    sort: 'posted_at:desc',
    'pagination[page]': page,
    'pagination[pageSize]': pageSize,
  };
  const q = search?.trim();
  if (q) {
    params['filters[$or][0][title][$containsi]'] = q;
    params['filters[$or][1][sort_description][$containsi]'] = q;
    params['filters[$or][2][platform][$containsi]'] = q;
  }

  const res = await api.get('/social-medias', { params });
  const raw = Array.isArray(res?.data) ? res.data : [];
  const items = raw.map(normalizeItem);
  const meta = res?.meta?.pagination || {};

  return {
    items,
    totalCount: meta.total || items.length,
    totalPages: meta.pageCount || 1,
    currentPage: meta.page || page,
  };
}

export default { fetchSocialMedias };
