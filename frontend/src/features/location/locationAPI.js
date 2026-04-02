import { apiService } from '@/services/api';
import { API_ENDPOINTS } from '@/services/endpoints';

const STRAPI_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337').replace(/\/api\/?$/, '');

/**
 * Resolve Strapi media URL (v4: data.attributes.url, v5: url at top level)
 */
function resolveImageUrl(media) {
  if (!media) return null;
  const url = media?.data?.attributes?.url ?? media?.url ?? (typeof media === 'string' ? media : null);
  if (!url) return null;
  return url.startsWith('http') ? url : `${STRAPI_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

function resolveImageUrls(media) {
  if (!media) return [];

  const data = media?.data;
  let mediaItems = [];

  if (Array.isArray(media)) {
    mediaItems = media;
  } else if (Array.isArray(data)) {
    mediaItems = data;
  } else {
    mediaItems = [media];
  }

  return [...new Set(mediaItems.map(resolveImageUrl).filter(Boolean))];
}

/**
 * Flatten Strapi unit to { id, name, image, map_link, site_manager, hr_manager, contact, address }
 * Supports both legacy unit_* and renamed route_* schemas.
 */
function normalizeUnit(u) {
  if (!u) return { id: null, name: '', address: '', image: null, images: [], unit_map_link: '', site_manager: '', hr_manager: '', contact: '' };
  const attrs = u?.attributes ?? u;
  const imageField =
    attrs?.unit_imag ??
    attrs?.unit_images ??
    attrs?.unit_img ??
    u?.unit_imag ??
    u?.unit_images ??
    u?.unit_img ??
    null;
  const images = resolveImageUrls(imageField);
  return {
    id: u?.id ?? u?.documentId ?? attrs?.unit_id ?? null,
    name: attrs?.unit_name ?? attrs?.name ?? '',
    address: attrs?.address ?? u?.address ?? '',
    image: images[0] ?? null,
    images,
    unit_map_link: attrs?.unit_map_link ?? attrs?.mapLink ?? u?.unit_map_link ?? u?.mapLink ?? '',
    site_manager: attrs?.site_manager ?? attrs?.siteManager ?? u?.site_manager ?? u?.siteManager ?? '',
    hr_manager: attrs?.hr_manager ?? attrs?.hrManager ?? u?.hr_manager ?? u?.hrManager ?? '',
    contact: attrs?.contact ?? u?.contact ?? '',
  };
}

/**
 * Normalize Strapi v4/v5 response to flat { id, name } for dropdown
 */
function normalizeLocationsList(raw) {
  const arr = Array.isArray(raw) ? raw : raw?.data ?? [];
  return arr
    .filter((item) => (item?.attributes?.active ?? item?.active ?? true) !== false)
    .map((item) => ({
      id: item.id ?? item.documentId,
      documentId: item.documentId ?? item.id,
      name: item?.attributes?.name ?? item?.name ?? '',
    }));
}

/**
 * Fetch location list for dropdown (GET /unit-locations)
 */
export const fetchLocationsList = async () => {
  const response = await apiService.get(API_ENDPOINTS.LOCATION.UNIT_LOCATIONS, {
    params: { sort: 'name:asc' },
  });
  return normalizeLocationsList(response);
};

/**
 * Normalize location with units to array of units
 */
function locationToUnits(location) {
  if (!location) return [];
  const unitsRaw = location?.Units ?? location?.units ?? location?.attributes?.Units ?? location?.attributes?.units ?? [];
  const arr = Array.isArray(unitsRaw) ? unitsRaw : unitsRaw?.data ?? [];
  return arr.map(normalizeUnit);
}

/**
 * Fetch units for a location (GET /unit-locations/:documentId with populate)
 */
export const fetchUnitsByLocation = async (locationId) => {
  if (!locationId) return [];

  try {
    const loc = await apiService.get(API_ENDPOINTS.LOCATION.UNIT_LOCATION_BY_ID(locationId), {
      params: { 
        sort: 'name:asc',
      },
    });
    const data = loc?.data ?? loc;
    if ((data?.attributes?.active ?? data?.active ?? true) === false) return [];
    return locationToUnits(data);
  } catch (err) {
    console.error('Units fetch failed:', err);
    return [];
  }
};
