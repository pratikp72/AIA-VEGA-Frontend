import { mockDelay, USE_MOCK_DATA } from '@/services/mockData';
import { apiService } from '@/services/api';

// Simple mock gallery items for development
const MOCK_GALLERY = Array.from({ length: 20 }).map((_, i) => {
  const isVideo = i % 3 === 0;
  const company = i % 2 === 0 ? 'AIA' : 'VEGA';
  
  // Different sample videos (all under 1 minute)
  const videoUrls = [
    'https://www.w3schools.com/html/mov_bbb.mp4', // ~10 seconds
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', // ~15 seconds
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', // ~15 seconds
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', // ~15 seconds
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', // ~15 seconds
  ];
  
  return {
    id: i + 1,
    title: isVideo ? `Video ${i + 1}` : `Image ${i + 1}`,
    type: isVideo ? 'Video' : 'Image',
    company,
    date: `2025-0${(i % 9) + 1}-0${(i % 27) + 1}`,
    description: 'This image captures a moment from an internal session or workshop conducted by the organization.',
    location: i % 2 === 0 ? 'Odhav, Ahmedabad' : 'Mumbai, India',
    thumbnail: isVideo
      ? `https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&fit=crop&q=80&auto=format&ixlib=rb-4.0.0&sat=${i}`
      : `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&fit=crop&q=80&auto=format&ixlib=rb-4.0.0&sat=${i}`,
    url: isVideo
      ? videoUrls[i % videoUrls.length]
      : `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&fit=crop&q=80&auto=format&ixlib=rb-4.0.0&sat=${i}`,
  };
});

export async function fetchGallery(page = 1, limit = 12) {
  if (USE_MOCK_DATA) {
    await mockDelay(200);
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      items: MOCK_GALLERY.slice(start, end),
      totalPages: Math.max(1, Math.ceil(MOCK_GALLERY.length / limit)),
      totalItems: MOCK_GALLERY.length,
      currentPage: page,
    };
  }

  // Real API call
  try {
    const res = await apiService.get('/gallery-items', {
      params: {
        pagination: {
          page,
          pageSize: limit,
        },
        sort: ['date:asc'],
        populate: '*',
      },
    });
    // API returns { data: [...], meta: { pagination: {...} } }
    const { data, meta } = res;
    return {
      items: Array.isArray(data) ? data : [],
      totalPages: meta?.pagination?.pageCount || 1,
      totalItems: meta?.pagination?.total || 0,
      currentPage: meta?.pagination?.page || page,
    };
  } catch (err) {
    return {
      items: [],
      totalPages: 1,
      totalItems: 0,
      currentPage: page,
    };
  }
}

export default { fetchGallery };
