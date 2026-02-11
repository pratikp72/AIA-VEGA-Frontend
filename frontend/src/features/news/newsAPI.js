import api from '@/services/api';
import API_ENDPOINTS from '@/services/endpoints';
import { USE_MOCK_DATA, mockDelay, MOCK_NEWS_DATA } from '@/services/mockData';

// ==================== FETCH ALL NEWS ====================
export const fetchAllNews = async (page = 1, limit = 10) => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      news: MOCK_NEWS_DATA.slice(start, end),
      totalPages: Math.ceil(MOCK_NEWS_DATA.length / limit),
      totalItems: MOCK_NEWS_DATA.length,
      currentPage: page,
    };
  }
  
  // 🔌 BACKEND INTEGRATION: Uncomment when ready
  // return await api.get(`${API_ENDPOINTS.NEWS.LIST}?page=${page}&limit=${limit}`);
  
  return {
    news: MOCK_NEWS_DATA,
    totalPages: 1,
    totalItems: MOCK_NEWS_DATA.length,
    currentPage: page,
  };
};

// ==================== FETCH BY CATEGORY ====================
export const fetchNewsByCategory = async (category, page = 1, limit = 10) => {
  if (USE_MOCK_DATA) {
    await mockDelay(500);
    let filtered = MOCK_NEWS_DATA;
    
    if (category !== 'all') {
      filtered = MOCK_NEWS_DATA.filter(
        (news) => news.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      news: filtered.slice(start, end),
      totalPages: Math.ceil(filtered.length / limit),
      totalItems: filtered.length,
      currentPage: page,
    };
  }
  
  // 🔌 BACKEND INTEGRATION: Uncomment when ready
  // return await api.get(`${API_ENDPOINTS.NEWS.LIST}?category=${category}&page=${page}&limit=${limit}`);
  
  return {
    news: MOCK_NEWS_DATA,
    totalPages: 1,
    totalItems: MOCK_NEWS_DATA.length,
    currentPage: page,
  };
};

// ==================== FETCH SINGLE NEWS ====================
export const fetchNewsById = async (id) => {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    return MOCK_NEWS_DATA.find((news) => news.id === parseInt(id));
  }
  
  // 🔌 BACKEND INTEGRATION: Uncomment when ready
  // return await api.get(API_ENDPOINTS.NEWS.GET(id));
  
  return MOCK_NEWS_DATA[0];
};

export default {
  fetchAllNews,
  fetchNewsByCategory,
  fetchNewsById,
};