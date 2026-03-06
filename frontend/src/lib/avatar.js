const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api').replace(/\/api\/?$/, '');

function getCompanyTag(company) {
  return (company || '').toString().trim().toLowerCase();
}

function getFirstLetter(name, fallback = '?') {
  const first = (name || '').trim()[0] || fallback;
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
 * - AIA users: use backend photograph when available.
 * - Vega users: always show first-letter fallback (no image).
 * - Others: use photograph if present, else first-letter fallback.
 */
export function getAvatarPropsForEmployee(user) {
  const name = user?.employee_name || user?.username || user?.name || 'Unknown';
  const companyTag = getCompanyTag(user?.company);
  const firstLetter = getFirstLetter(name, user?.email?.[0] || '?');

  if (companyTag.includes('vega')) {
    return { src: '', initials: firstLetter };
  }

  const photoSrc = getUserPhotoSrc(user);

  if (companyTag.includes('aia')) {
    return { src: photoSrc, initials: firstLetter };
  }

  return { src: photoSrc, initials: firstLetter };
}
