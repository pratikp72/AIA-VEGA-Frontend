import { apiService } from '@/services/api';
import { API_ENDPOINTS } from '@/services/endpoints';

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337').replace(/\/api\/?$/, '');

function normalizeGalleryItem(item) {
  if (!item) return null;
  const raw = item?.attributes ?? item;

  // company relation — Strapi: { data: [{ attributes: { name } }] } or [{ name }] or string
  let companyName = '';
  if (typeof raw.company === 'string') companyName = raw.company;
  else {
    const companyData = raw.company ?? raw.companies;
    const companyArr = Array.isArray(companyData) ? companyData : companyData?.data;
    const first = Array.isArray(companyArr) && companyArr.length > 0 ? companyArr[0] : null;
    if (first) companyName = first.attributes?.name ?? first.name ?? (typeof first === 'string' ? first : '');
  }

  const imageObj = raw.image?.data ?? raw.image;
  const videoObj = raw.video?.data ?? raw.video;
  const rawImageUrl = imageObj?.url ?? imageObj?.attributes?.url;
  const rawVideoUrl = videoObj?.url ?? videoObj?.attributes?.url;
  const imageUrl = rawImageUrl
    ? (rawImageUrl.startsWith('http') ? rawImageUrl : BASE_URL + rawImageUrl)
    : null;
  const videoUrl = rawVideoUrl
    ? (rawVideoUrl.startsWith('http') ? rawVideoUrl : BASE_URL + rawVideoUrl)
    : null;

  const isVideo = (raw.media_type ?? raw.mediaType ?? item.media_type) === 'Video' || (raw.type ?? item.type) === 'video';
  const hasVideo = !!(raw.video ?? item.video ?? videoObj);
  const derivedType = hasVideo ? 'Video' : 'Image';

  return {
    id: item.id ?? item.documentId,
    title: (raw.title ?? item.title) || '',
    type: (raw.media_type ?? raw.mediaType ?? item.media_type ?? item.type ?? derivedType) || 'Image',
    company: companyName,  // string, e.g. "AIA" or "VEGA"
    date: (raw.date ?? raw.createdAt ?? item.date ?? item.createdAt) || '',
    description: (raw.description ?? item.description) || '',
    location: (raw.location ?? item.location) || '',
    thumbnail: isVideo ? null : imageUrl,
    url: isVideo ? videoUrl : imageUrl,
  };
}

/**
 * Fetch gallery items from /api/gallery-items/by-filters.
 * Uses backend data only.
 */
export async function fetchGalleryByFilters(filters = {}) {
  const { company, type, sortBy, search, date } = filters;

  const params = new URLSearchParams();
  if (company) params.set('company', company);
  if (type) params.set('type', type.toLowerCase());
  if (sortBy) params.set('sortBy', sortBy);
  if (search?.trim()) params.set('search', search.trim());
  if (date) params.set('date', typeof date === 'string' ? date.slice(0, 10) : (date?.toISOString?.().slice(0, 10) ?? ''));

  const res = await apiService.get(`${API_ENDPOINTS.GALLERY.BY_FILTERS}?${params.toString()}`);
  const list = Array.isArray(res) ? res : res?.data ?? [];
  const items = list.map(normalizeGalleryItem).filter(Boolean);
  return { items };
}

export default { fetchGalleryByFilters };
