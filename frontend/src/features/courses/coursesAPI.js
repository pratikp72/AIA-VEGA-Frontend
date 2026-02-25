import api from '@/services/api';
import API_ENDPOINTS from '@/services/endpoints';
import { USE_MOCK_DATA, mockDelay, MOCK_COURSE_CATEGORIES } from '@/services/mockData';

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api').replace(/\/api\/?$/, '');

function withImageUrl(imageObj) {
  if (!imageObj) return null;
  const url =
    imageObj.formats?.large?.url ||
    imageObj.formats?.medium?.url ||
    imageObj.formats?.small?.url ||
    imageObj.formats?.thumbnail?.url ||
    imageObj.url;
  if (!url) return null;
  return url.startsWith('http') ? url : BASE_URL + (url.startsWith('/') ? url : `/${url}`);
}

function extractRichText(blocks) {
  if (!Array.isArray(blocks)) return '';
  return blocks
    .flatMap(block => block.children || [])
    .map(child => child.text || '')
    .join(' ');
}

function extractTextContent(blocks) {
  if (!Array.isArray(blocks)) return '';
  return blocks
    .flatMap(block => block.children || [])
    .map(child => child.text || '')
    .join('\n\n');
}

function normalizeModule(module, index) {
  return {
    id: module.id,
    moduleNumber: index + 1,
    moduleTitle: module.title || '',
    moduleType: module.module_content_type || 'Text',
    moduleDuration: typeof module.module_duration_min === 'number' ? module.module_duration_min : '',
    moduleStatus: 'active',
    content: extractTextContent(module.text_content),
  };
}

function normalizeCourse(course) {
  const durationMin = course.course_duration_min || 0;
  const rawModules = Array.isArray(course.modules) ? course.modules : [];
  return {
    id: course.id,
    documentId: course.documentId,
    title: course.title || '',
    description: extractRichText(course.description),
    category: course.course_category || 'Other',
    // UI fields expected by CoursesCategoryPage (original card design)
    image: withImageUrl(course.thumbnail),
    moduleDuration: durationMin || '',    modules: rawModules.length || 0,
    modulesList: rawModules.map(normalizeModule),
    learners: 0,
    progress: 0,
    completed: false,
    certificationGenerated: false,
    contentType: null,
    time: null,
    // Additional metadata
    minPassingScore: course.min_passing_score || 0,
    languages: course.course_language || [],
    orientationRequired: course.orientation_required || false,
    active: course.active !== false,
  };
}

export const fetchAllCourses = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    return MOCK_COURSE_CATEGORIES;
  }
  const response = await api.get(API_ENDPOINTS.COURSES.LIST, { params: { populate: '*' } });
  const raw = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
  return raw.filter(c => c.active !== false).map(normalizeCourse);
};

export const fetchCourseById = async (documentId) => {
  const response = await api.get(API_ENDPOINTS.COURSES.GET(documentId), { params: { populate: '*' } });
  const raw = response?.data || response;
  return normalizeCourse(raw);
};

export const fetchCourseCategories = fetchAllCourses;

export default {
  fetchAllCourses,
  fetchCourseCategories,
  fetchCourseById,
};
