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
  // Strapi returns video_file as an array for media fields — take the first item
  const videoFile = Array.isArray(module.video_file) ? module.video_file[0] : module.video_file;
  const rawUrl = videoFile?.url;
  const videoUrl = rawUrl
    ? (rawUrl.startsWith('http') ? rawUrl : BASE_URL + (rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`))
    : null;

  return {
    id: module.id,
    moduleId: module.module_id || '',
    moduleNumber: index + 1,
    moduleTitle: module.title || '',
    moduleType: module.module_content_type || 'Text',
    moduleDuration: typeof module.module_duration_min === 'number' ? module.module_duration_min : '',
    moduleStatus: 'active',
    content: extractTextContent(module.text_content),
    text_content: module.text_content || null,
    video_file: videoFile && videoUrl ? { ...videoFile, url: videoUrl } : null,
    mark_as_read: module.mark_as_read || false,
    language: module.language || '',
  };
}

function normalizeCourse(course) {
  const durationMin = course.course_duration_min || 0;
  const rawModules = Array.isArray(course.modules) ? course.modules : [];
  // Normalize quiz array to always include quiz_questions if present
  const quiz = Array.isArray(course.quiz)
    ? course.quiz.map(q => ({
        ...q,
        quiz_questions: Array.isArray(q.quiz_questions) ? q.quiz_questions : [],
      }))
    : [];
  return {
    id: course.id,
    documentId: course.documentId,
    title: course.title || '',
    description: extractRichText(course.description),
    category: course.course_category || 'Other',
    // UI fields expected by CoursesCategoryPage (original card design)
    image: withImageUrl(course.thumbnail),
    moduleDuration: durationMin || '',
    modules: rawModules.length || 0,
    rawModules,                              // raw Strapi format — needed for PUT updates
    modulesList: rawModules.map(normalizeModule),
    quiz,
    feedback: Array.isArray(course.feedback)
      ? course.feedback.map(fb => ({
          ...fb,
          feedback_question: Array.isArray(fb.feedback_question) ? fb.feedback_question : [],
        }))
      : [],
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
const response = await api.get(API_ENDPOINTS.COURSES.LIST, {
  params: {
    'populate[thumbnail]': true,
    'populate[quiz][populate][quiz_questions][populate][options]': true,
    'populate[modules]': true,
  }
});
  const raw = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
  return raw.filter(c => c.active !== false).map(normalizeCourse);
};

export const fetchCourseById = async (documentId) => {
  const response = await api.get(API_ENDPOINTS.COURSES.GET(documentId), {
     params: {
      'populate[modules][populate]': '*',
      'populate[thumbnail]': true,
      'populate[feedback][populate][feedback_question]': true,
      'populate[orientation_detail]': true,
      'populate[prerequisite_courses]': true,
      'populate[quiz][populate][quiz_questions][populate][options]': true,
      'populate[quiz][populate][quiz_instruction]': true,
      'populate[quiz][populate][quiz_instruction_checklist][populate]': '*',
    },
  });
  const raw = response?.data || response;
  return normalizeCourse(raw);
};

export const updateModuleMarkAsRead = async (courseDocumentId, moduleId, rawModules) => {
  const updatedModules = rawModules.map((module) => {
    let videoFile = null;
    if (Array.isArray(module.video_file) && module.video_file.length > 0) {
      videoFile = module.video_file.map((f) => f.id);
    } else if (module.video_file?.id) {
      videoFile = module.video_file.id;
    }
    return {
      module_id: module.module_id,
      language: module.language,
      title: module.title,
      module_content_type: module.module_content_type,
      text_content: module.text_content ?? null,
      mark_as_read: module.id === moduleId ? true : module.mark_as_read,
      module_duration_min: module.module_duration_min ?? null,
      video_file: videoFile,
    };
  });

  console.log('[updateModuleMarkAsRead] PUT payload:', JSON.stringify({ data: { modules: updatedModules } }, null, 2));

  await api.put(API_ENDPOINTS.COURSES.GET(courseDocumentId), {
    data: { modules: updatedModules },
  }, { timeout: 30000 });
};

export const markModuleProgress = async ({ userId, courseId, moduleId }) => {
  return api.post('/user-progress/mark-module', { userId, courseId, moduleId });
};

// Returns completed module IDs and progress status for this user+course.
// Falls back to empty on any error so the UI stays functional.
// Pass { fresh: true } to bypass GET deduplication cache (use after mutations like mark-as-read).
export const fetchUserCourseProgress = async (userId, courseNumericId, opts = {}) => {
  if (!userId || !courseNumericId) return { completedModules: [], progressStatus: null };
  try {
    const params = { userId, courseId: courseNumericId };
    if (opts.fresh) params._t = Date.now(); // bypass dedupe cache
    const response = await api.get('/user-progress/progress', { params });
    const data = response?.data || response;
    const completedModules = Array.isArray(data?.completed_modules) ? data.completed_modules.map(String) : [];
    return { completedModules, progressStatus: data?.progress_status ?? null };
  } catch {
    return { completedModules: [], progressStatus: null };
  }
};

// Returns all user progress keyed by course id (for course list completion badges).
export const fetchAllUserProgress = async (userId) => {
  if (!userId) return {};
  try {
    const res = await api.get('/user-progress/all', { params: { userId } });
    return res || {};
  } catch {
    return {};
  }
};

export const fetchCourseCategories = fetchAllCourses;

export default {
  fetchAllCourses,
  fetchCourseCategories,
  fetchCourseById,
};
