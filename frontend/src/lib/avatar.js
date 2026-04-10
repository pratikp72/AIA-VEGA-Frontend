const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api').replace(/\/api\/?$/, '');

const HONORIFIC_PREFIXES = new Set([
  'mr', 'mrs', 'ms', 'miss', 'dr', 'prof', 'sir', 'madam',
]);

function getNameWithoutPrefix(name) {
  const raw = (name || '').toString().trim();
  if (!raw) return '';
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const normalizedFirst = parts[0].replace(/[^a-zA-Z]/g, '').toLowerCase();
  if (normalizedFirst && HONORIFIC_PREFIXES.has(normalizedFirst) && parts.length > 1) {
    return parts.slice(1).join(' ');
  }
  return raw;
}

function getFirstLetter(name, fallback = '?') {
  const cleanedName = getNameWithoutPrefix(name);
  const first = cleanedName[0] || fallback;
  return first.toUpperCase();
}

function resolveMediaUrl(media) {
  if (!media) return '';
  if (Array.isArray(media)) {
    if (media.length === 0) return '';
    return resolveMediaUrl(media[0]);
  }
  if (typeof media === 'string') {
    if (!media.trim()) return '';
    return media.startsWith('http') ? media : `${API_BASE}${media.startsWith('/') ? media : `/${media}`}`;
  }

  const node = media?.data?.attributes ?? media?.data ?? media;
  const rawUrl =
    node?.formats?.large?.url ||
    node?.formats?.medium?.url ||
    node?.formats?.small?.url ||
    node?.formats?.thumbnail?.url ||
    node?.url ||
    '';

  if (!rawUrl) return '';
  return rawUrl.startsWith('http') ? rawUrl : `${API_BASE}${rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`}`;
}

function getUserPhotoSrc(user) {
  if (!user) return '';

  // AIA users: prefer the direct mount-served photo (no Strapi upload involved)
  const empPhotoFile = user.emp_photo_file || user.attributes?.emp_photo_file;
  if (empPhotoFile && String(empPhotoFile).trim()) {
    return `${API_BASE}/empimages/${encodeURIComponent(String(empPhotoFile).trim())}`;
  }

  // Fallback: Strapi media relation (photograph field) for any user
  const candidates = [
    user.photograph,
    user.avatar,
    user.photo,
    user.profile_photo,
    user.profilePhoto,
    user.avatar_url,
    user.avatarUrl,
    user.image,
    user.image_url,
    user.profile_image,
    user.attributes?.photograph,
    user.attributes?.avatar,
    user.attributes?.photo,
    user.attributes?.profile_photo,
    user.attributes?.profilePhoto,
  ];

  for (const candidate of candidates) {
    const src = resolveMediaUrl(candidate);
    if (src) return src;
  }

  return '';
}

/**
 * Avatar rule:
 * - AIA users: serve photo from /empimages/:emp_photo_file (direct mount, always fresh)
 * - Vega / others: use Strapi photograph media if present
 * - No photo found: first-letter initials fallback
 */
export function getAvatarPropsForEmployee(user) {
  const name = user?.employee_name || user?.username || user?.name || 'Unknown';
  const firstLetter = getFirstLetter(name, user?.email?.[0] || '?');
  const photoSrc = getUserPhotoSrc(user);
  return { src: photoSrc, initials: firstLetter };
}
