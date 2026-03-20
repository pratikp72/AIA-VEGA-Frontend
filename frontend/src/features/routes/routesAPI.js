import { apiService } from '@/services/api';
import { API_ENDPOINTS } from '@/services/endpoints';

const STRAPI_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337').replace(/\/api\/?$/, '');

function resolveMediaUrl(media) {
  if (!media) return null;
  const url = media?.data?.attributes?.url ?? media?.url ?? (typeof media === 'string' ? media : null);
  if (!url) return null;
  return url.startsWith('http') ? url : `${STRAPI_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

function normalizeSift(s) {
  const attrs = s?.attributes ?? s ?? {};
  return {
    name: attrs.sift_name ?? attrs.name ?? '',
    time: attrs.sift_time ?? attrs.time ?? '',
  };
}

function normalizeRoute(route) {
  const attrs = route?.attributes ?? route ?? {};
  const rawSifts = attrs.bus_sifts ?? route?.bus_sifts ?? [];
  const arr = Array.isArray(rawSifts) ? rawSifts : rawSifts?.data ?? [];
  return {
    id: attrs.route_id ?? route?.route_id ?? route?.id ?? null,
    routeId: attrs.route_id ?? route?.route_id ?? null,
    name: attrs.route_name ?? attrs.name ?? '',
    shifts: arr.map(normalizeSift),
  };
}

function normalizeUnitWithRoutes(u) {
  const attrs = u?.attributes ?? u ?? {};
  const image = attrs.unit_img ?? u?.unit_img;
  const rawRoutes = attrs.routes ?? u?.routes ?? [];
  const routesArr = Array.isArray(rawRoutes) ? rawRoutes : rawRoutes?.data ?? [];
  return {
    id: u?.id ?? u?.documentId ?? attrs.unit_id ?? null,
    unitId: attrs.unit_id ?? null,
    unitName: attrs.unit_name ?? attrs.name ?? '',
    address: attrs.address ?? '',
    contact: attrs.contact ?? '',
    siteManager: attrs.site_manager ?? '',
    hrManager: attrs.hr_manager ?? '',
    mapLink: attrs.map_link ?? '',
    image: resolveMediaUrl(image),
    routes: routesArr.map(normalizeRoute),
  };
}

/**
 * Fetch a single unit-location with all nested units → routes → shifts populated.
 */
export const fetchLocationRoutes = async (locationId) => {
  if (!locationId) return null;

  const res = await apiService.get(API_ENDPOINTS.LOCATION.UNIT_LOCATION_BY_ID(locationId), {
    params: {
      'populate[units][populate][unit_img]': true,
      'populate[units][populate][routes][populate][bus_sifts]': true,
      'populate[company]': true,
      sort: 'name:asc',
    },
  });

  const data = res?.data ?? res;
  const unitsRaw = data?.units ?? data?.attributes?.units ?? [];
  const unitsArr = Array.isArray(unitsRaw) ? unitsRaw : unitsRaw?.data ?? [];
  const activeFlag = data?.attributes?.active ?? data?.active ?? true;
  if (activeFlag === false) return null;

  return {
    id: data?.id ?? data?.documentId ?? null,
    name: data?.attributes?.name ?? data?.name ?? '',
    active: activeFlag,
    note: data?.attributes?.note ?? data?.note ?? null,
    company: data?.attributes?.company ?? data?.company ?? null,
    units: unitsArr.map(normalizeUnitWithRoutes),
  };
};

