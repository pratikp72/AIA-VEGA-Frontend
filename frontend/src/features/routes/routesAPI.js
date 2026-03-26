// import { apiService } from '@/services/api';
// import { API_ENDPOINTS } from '@/services/endpoints';

// const STRAPI_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337').replace(/\/api\/?$/, '');

// function resolveMediaUrl(media) {
//   if (!media) return null;
//   const url = media?.data?.attributes?.url ?? media?.url ?? (typeof media === 'string' ? media : null);
//   if (!url) return null;
//   return url.startsWith('http') ? url : `${STRAPI_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
// }

// function normalizeShift(s) {
//   const attrs = s?.attributes ?? s ?? {};
//   return {
//     name: attrs.shift_name ?? attrs.name ?? '',
//     time: attrs.shift_time ?? attrs.time ?? '',
//   };
// }
// function normalizeRoute(route) {
//   const attrs = route?.attributes ?? route ?? {};
//   const stopsRaw = attrs.bus_stops ?? route?.bus_stops ?? [];
//   const stopsArr = Array.isArray(stopsRaw) ? stopsRaw : stopsRaw?.data ?? [];

//   const stops = stopsArr.map((stop) => {
//     const sAttrs = stop?.attributes ?? stop ?? {};
//     const shiftsRaw = sAttrs.bus_shifts ?? [];
//     const shiftsArr = Array.isArray(shiftsRaw) ? shiftsRaw : shiftsRaw?.data ?? [];

//     return {
//       id: sAttrs.stop_id ?? stop?.id,
//       name: sAttrs.stop_name ?? '',
//       locationLink: sAttrs.bus_stop_location_link ?? '',
//       shifts: shiftsArr.map((s) => ({
//         name: s.shift_name,
//         time: s.shift_time,
//       })),
//     };
//   });

//   return {
//     id: attrs.route_id ?? route?.id,
//     routeId: attrs.route_id ?? route?.id,
//     name: attrs.route_name ?? '',
//     image: attrs.route_img ? resolveMediaUrl(attrs.route_img) : null,
//     stops,
//   };
// }
// function normalizeUnitWithRoutes(u) {
//   const attrs = u?.attributes ?? u ?? {};
//   const image = attrs.unit_img ?? u?.unit_img ?? null;
//   const rawRoutes = attrs.routes ?? u?.routes ?? [];
//   const routesArr = Array.isArray(rawRoutes) ? rawRoutes : rawRoutes?.data ?? [];
//   return {
//     id: u?.id ?? u?.documentId ?? attrs.unit_id ?? null,
//     unitId: attrs.unit_id ?? null,
//     unitName: attrs.unit_name ?? attrs.name ?? '',
//     address: attrs.address ?? '',
//     contact: attrs.contact ?? '',
//     siteManager: attrs.site_manager ?? '',
//     hrManager: attrs.hr_manager ?? '',
//     mapLink: attrs.unit_map_link ?? attrs.map_link ?? '',
//     image: resolveMediaUrl(image),
//     routes: routesArr.map(normalizeRoute),
//     note: attrs.note ?? '',
//   };
// }

// /**
//  * Fetch a single unit-location with all nested units → routes → shifts populated.
//  */
// export const fetchLocationRoutes = async (locationId) => {
//   if (!locationId) return null;

//   const res = await apiService.get(API_ENDPOINTS.LOCATION.UNIT_LOCATION_BY_ID(locationId), {
//     params: {
//       sort: 'name:asc',
//     },
//   });

//   const data = res?.data ?? res;
//   const unitsRaw = data?.Units ?? data?.units ?? data?.attributes?.Units ?? data?.attributes?.units ?? [];
//   const unitsArr = Array.isArray(unitsRaw) ? unitsRaw : unitsRaw?.data ?? [];
//   const activeFlag = data?.attributes?.active ?? data?.active ?? true;
//   if (activeFlag === false) return null;

//   return {
//     id: data?.id ?? data?.documentId ?? null,
//     name: data?.attributes?.name ?? data?.name ?? '',
//     active: activeFlag,
//     note: data?.attributes?.note ?? data?.note ?? null,
//     company: data?.attributes?.company ?? data?.company ?? null,
//     units: unitsArr.map(normalizeUnitWithRoutes),
//   };
// };

import { apiService } from '@/services/api';
import { API_ENDPOINTS } from '@/services/endpoints';

const STRAPI_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337').replace(/\/api\/?$/, '');

function resolveMediaUrl(media) {
  if (!media) return null;

  const url =
    media?.data?.attributes?.url ??
    media?.url ??
    (typeof media === 'string' ? media : null);

  if (!url) return null;

  return url.startsWith('http')
    ? url
    : `${STRAPI_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

/* =========================
   SHIFT
========================= */
function normalizeShift(s) {
  const attrs = s?.attributes ?? s ?? {};
  return {
    name: attrs.shift_name ?? attrs.name ?? '',
    time: attrs.shift_time ?? attrs.time ?? '',
  };
}

/* =========================
   ROUTE
========================= */
function normalizeRoute(route) {
  const attrs = route?.attributes ?? route ?? {};

  const stopsRaw = attrs.bus_stops ?? [];
  const stopsArr = Array.isArray(stopsRaw)
    ? stopsRaw
    : stopsRaw?.data ?? [];

  const stops = stopsArr.map((stop) => {
    const sAttrs = stop?.attributes ?? stop ?? {};

    const shiftsRaw = sAttrs.bus_shifts ?? [];
    const shiftsArr = Array.isArray(shiftsRaw)
      ? shiftsRaw
      : shiftsRaw?.data ?? [];

    return {
      id: sAttrs.stop_id ?? stop?.id,
      name: sAttrs.stop_name ?? '',
      locationLink: sAttrs.bus_stop_location_link ?? '',
      shifts: shiftsArr.map(normalizeShift),
    };
  });

  return {
    id: attrs.route_id ?? route?.id,
    routeId: attrs.route_id ?? route?.id,
    name: attrs.route_name ?? '',
    image: resolveMediaUrl(attrs.route_img),
    stops,
  };
}

/* =========================
   UNIT
========================= */
function normalizeUnitWithRoutes(u) {
  const attrs = u?.attributes ?? u ?? {};

  const routesRaw = attrs.routes ?? [];
  const routesArr = Array.isArray(routesRaw)
    ? routesRaw
    : routesRaw?.data ?? [];

  return {
    id: u?.id ?? u?.documentId ?? null,
    unitId: attrs.unit_id ?? null,
    unitName: attrs.unit_name ?? attrs.name ?? '',

    address: attrs.address ?? '',
    contact: attrs.contact ?? '',
    siteManager: attrs.site_manager ?? '',
    hrManager: attrs.hr_manager ?? '',

    mapLink: attrs.unit_map_link ?? '',
    image: resolveMediaUrl(attrs.unit_img),
    note: attrs.note ?? '',

    routes: routesArr.map(normalizeRoute),
  };
}

/* =========================
   MAIN API
========================= */
export const fetchLocationRoutes = async (locationId) => {
  if (!locationId) return null;

  const res = await apiService.get(
    API_ENDPOINTS.LOCATION.UNIT_LOCATION_BY_ID(locationId),
    {
      params: {
        sort: 'name:asc',
      },
    }
  );

  // handle Strapi response properly
  const data = res?.data?.data ?? res?.data ?? res;

  const unitsRaw =
    data?.Units ??
    data?.units ??
    data?.attributes?.Units ??
    data?.attributes?.units ??
    [];

  const unitsArr = Array.isArray(unitsRaw)
    ? unitsRaw
    : unitsRaw?.data ?? [];

  const activeFlag =
    data?.active ??
    data?.attributes?.active ??
    true;

  if (activeFlag === false) return null;

  return {
    id: data?.id ?? data?.documentId ?? null,
    name: data?.name ?? data?.attributes?.name ?? '',
    active: activeFlag,
    company: data?.company ?? data?.attributes?.company ?? null,
    units: unitsArr.map(normalizeUnitWithRoutes),
  };
};