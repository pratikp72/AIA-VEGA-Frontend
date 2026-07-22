// 'use client';

// import SurfaceCard from '@/components/common/SurfaceCard';
// import { Calendar, ExternalLink } from 'lucide-react';

// function formatDate(value) {
//   if (!value) return '';
//   // Date-only (YYYY-MM-DD) — avoid timezone shifting the day
//   const raw = String(value).trim();
//   if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
//     const [y, m, d] = raw.split('-').map(Number);
//     return new Date(y, m - 1, d).toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//     });
//   }
//   const d = new Date(raw);
//   if (Number.isNaN(d.getTime())) return '';
//   return d.toLocaleDateString('en-US', {
//     month: 'short',
//     day: 'numeric',
//     year: 'numeric',
//   });
// }

// /** Fallback when platform is empty in CMS. */
// function getPlatformLabel(link = '') {
//   const url = String(link).toLowerCase();
//   if (url.includes('linkedin.com')) return 'LinkedIn';
//   if (url.includes('instagram.com')) return 'Instagram';
//   if (url.includes('facebook.com') || url.includes('fb.com')) return 'Facebook';
//   if (url.includes('twitter.com') || url.includes('x.com')) return 'X';
//   if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
//   if (url.includes('threads.net')) return 'Threads';
//   return 'Social';
// }

// export default function SocialMediaCard({ item }) {
//   const title = item?.title || '';
//   const link = item?.link || '#';
//   const imageUrl = item?.imageUrl || '';
//   const description = item?.sort_description || '';
//   const platform = (item?.platform || '').trim() || getPlatformLabel(link);
//   const dateLabel = formatDate(item?.posted_at || item?.publishedAt || item?.createdAt);

//   return (
//     <a
//       href={link}
//       target="_blank"
//       rel="noopener noreferrer"
//       className="h-full block group"
//     >
//       <SurfaceCard className="p-0 gap-0 overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full flex flex-col">
//         <div className="relative h-48 overflow-hidden rounded-t-[20px] flex-shrink-0 bg-gray-100">
//           {imageUrl ? (
//             <img
//               src={imageUrl}
//               alt={title}
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <div className="w-full h-full bg-primary-opacity-10" aria-hidden />
//           )}
//           <div className="absolute top-3 left-3">
//             <span className="inline-block px-2.5 py-1 rounded-[4px] bg-primary text-white text-xs font-semibold shadow-sm">
//               {platform}
//             </span>
//           </div>
//         </div>

//         <div className="p-4 flex-1 flex flex-col min-h-0 gap-2">
//           {dateLabel ? (
//             <div className="flex items-center gap-2 text-small text-gray-medium">
//               <Calendar className="w-4 h-4 shrink-0" />
//               <span>{dateLabel}</span>
//             </div>
//           ) : null}

//           <h3 className="text-h3 text-gray-dark line-clamp-2 no-underline group-hover:text-primary-purple transition-colors">
//             {title}
//           </h3>

//           {description ? (
//             <p className="text-body text-gray-medium line-clamp-2">{description}</p>
//           ) : null}

//           <div className="mt-auto pt-2 text-primary-purple font-medium text-body inline-flex items-center gap-1.5 group-hover:underline">
//             View post
//             <ExternalLink className="w-4 h-4" />
//           </div>
//         </div>
//       </SurfaceCard>
//     </a>
//   );
// }


'use client';

import SurfaceCard from '@/components/common/SurfaceCard';
import { Calendar, ExternalLink } from 'lucide-react';

const NEW_WITHIN_DAYS = 7;

function formatDate(value) {
  if (!value) return '';

  const raw = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split('-').map(Number);

    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const d = new Date(raw);

  if (Number.isNaN(d.getTime())) return '';

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isRecent(value, withinDays = NEW_WITHIN_DAYS) {
  if (!value) return false;

  const raw = String(value).trim();

  let date;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split('-').map(Number);
    date = new Date(y, m - 1, d);
  } else {
    date = new Date(raw);
  }

  if (Number.isNaN(date.getTime())) return false;

  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - withinDays);

  return date >= cutoff;
}

function getPlatformLabel(link = '') {
  const url = String(link).toLowerCase();

  if (url.includes('linkedin.com')) return 'LinkedIn';
  if (url.includes('instagram.com')) return 'Instagram';
  if (url.includes('facebook.com')) return 'Facebook';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'X';
  if (url.includes('youtube.com')) return 'YouTube';

  return 'Social';
}

function PlatformIcon({ platform }) {
  const size = 20;
  switch (platform) {
    case 'LinkedIn':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="#0A66C2">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case 'Instagram':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="#E4405F">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    case 'Facebook':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="#1877F2">
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
        </svg>
      );
    case 'X':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="#080808">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
        </svg>
      );
    case 'YouTube':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="#FF0000">
          <path d="M23.498 6.186a2.974 2.974 0 00-2.09-2.104C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.408.536A2.974 2.974 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.974 2.974 0 002.09 2.104C4.495 20.454 12 20.454 12 20.454s7.505 0 9.408-.536a2.974 2.974 0 002.09-2.104C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
      case 'Twitter':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="#1DA1F2">
          <path d="M23.954 4.569c-.885.392-1.83.656-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.897-.959-2.178-1.555-3.594-1.555-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.247-2.229-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.395 0-.779-.023-1.158-.067C2.29 19.29 5.01 20 7.92 20c9.142 0 14.307-7.721 13.995-14.646a9.936 9.936 0 002.457-2.534z" />    
      </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="#585858">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm2.07-7.75l-.9.92C11.45 10.9 11 11.5 11 13h2c0-.99.39-1.71 1.01-2.33l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2h2c0-.55.45-1 1-1s1 .45 1 1c0 .28-.11.53-.29.71l-.93.95z" />
        </svg>
      );
  }
}

export default function SocialMediaCard({ item }) {
  const title = item?.title || '';
  const link = item?.link || '#';
  const imageUrl = item?.imageUrl || '';
  const description = item?.sort_description || '';

  const platform =
    (item?.platform || '').trim() || getPlatformLabel(link);

  const postedAt =
    item?.posted_at || item?.publishedAt || item?.createdAt;

  const dateLabel = formatDate(postedAt);

  const showNew = isRecent(postedAt);

return (
  <a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    className="block h-full group"
  >
    <SurfaceCard className="p-0 gap-0 overflow-hidden h-full flex flex-col hover:shadow-lg transition-all duration-300">

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-100" />
        )}

        {showNew && (
          <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-primary text-white text-xs font-semibold shadow">
            NEW
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">

        {/* Platform + Date */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <PlatformIcon platform={platform} />
            <span className="text-sm font-medium text-gray-700">
              {platform}
            </span>
          </div>

          {dateLabel && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              {dateLabel}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 leading-6 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {description}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:underline">
            View on {platform}
            <ExternalLink className="w-4 h-4" />
          </span>
        </div>

      </div>
    </SurfaceCard>
  </a>
);
}