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
  const pdfFile = Array.isArray(module.pdf_file) ? module.pdf_file[0] : module.pdf_file;
  const rawPdfUrl = pdfFile?.url;
  const pdfUrl = rawPdfUrl
    ? (rawPdfUrl.startsWith('http') ? rawPdfUrl : BASE_URL + (rawPdfUrl.startsWith('/') ? rawPdfUrl : `/${rawPdfUrl}`))
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
    pdf_file: pdfFile && pdfUrl ? { ...pdfFile, url: pdfUrl } : null,
    mark_as_read: module.mark_as_read || false,
    language: module.language || '',
    description: typeof module.video_description === 'string' && module.video_description
      ? module.video_description
      : Array.isArray(module.description) && module.description.length > 0
        ? extractTextContent(module.description)
        : null,
  };
}

function normalizeCourse(course) {
  const rawModules =
    Array.isArray(course.modules) ? course.modules
    : Array.isArray(course?.attributes?.modules) ? course.attributes.modules
    : [];
  const courseLanguages = Array.isArray(course.course_language) ? course.course_language : [];

  // Card stats should represent one language track, not all language variants together.
  const primaryLanguage = (courseLanguages[0] || '').trim().toLowerCase();
  const modulesForStats = primaryLanguage
    ? rawModules.filter((module) => String(module?.language || '').trim().toLowerCase() === primaryLanguage)
    : rawModules;
  const effectiveModulesForStats = modulesForStats.length > 0 ? modulesForStats : rawModules;
  const totalModuleDuration = effectiveModulesForStats.reduce((total, module) => {
    const moduleTimeRaw = module?.module_duration_min;
    const moduleTime = Number(moduleTimeRaw);
    return total + (Number.isFinite(moduleTime) && moduleTime > 0 ? moduleTime : 0);
  }, 0);
  const durationMinutes = Number.isFinite(totalModuleDuration) && totalModuleDuration > 0
    ? totalModuleDuration
    : 0;
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
    category: course.course_category || 'Other',
    // UI fields expected by CoursesCategoryPage (original card design)
    image: withImageUrl(course.thumbnail),
    moduleDuration: durationMinutes || '',
    duration: durationMinutes > 0 ? Math.round((durationMinutes / 60) * 10) / 10 : 0,
    durationMinutes,
    modules: effectiveModulesForStats.length || 0,
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
    languages: courseLanguages,
    orientationRequired: course.orientation_required || false,
    orientation_detail: Array.isArray(course.orientation_detail)
      ? course.orientation_detail
      : course.orientation_detail
        ? [course.orientation_detail]
        : [],
    prerequisite_courses: Array.isArray(course.prerequisite_courses)
      ? course.prerequisite_courses
      : course.prerequisite_courses
        ? [course.prerequisite_courses]
        : [],
    active: course.active !== false,
  };
}

const COURSES_LIST_PARAMS = {
  'populate[thumbnail]': true,
  'populate[quiz][populate][quiz_questions][populate][options]': true,
  'populate[modules]': true,
  'populate[orientation_detail]': true,
  'populate[prerequisite_courses]': true,
  'pagination[pageSize]': 50,
  sort: 'createdAt:desc',
};

export const fetchAllCourses = async () => {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    return MOCK_COURSE_CATEGORIES;
  }
  const all = [];
  let page = 1;
  let pageCount = 1;
  do {
    const response = await api.get(API_ENDPOINTS.COURSES.LIST, {
      params: {
        ...COURSES_LIST_PARAMS,
        'pagination[page]': page,
      },
    });
    const data = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
    all.push(...data);
    pageCount = response?.meta?.pagination?.pageCount ?? 1;
    page += 1;
  } while (page <= pageCount);
  return all.filter(c => c.active !== false).map(normalizeCourse);
};

/**
 * Fetch a single course by documentId.
 * @param {string} documentId - Course documentId
 * @param {{ language?: string }} opts - Optional. If language is set, backend should return only modules/quiz/feedback in that language.
 * Backend must populate quiz_questions.options so the quiz UI can show answer choices; see docs/BACKEND_QUIZ_OPTIONS_SPEC.md.
 */
export const fetchCourseById = async (documentId, opts = {}) => {
  const params = {
    'populate[modules][populate]': '*',
    'populate[thumbnail]': true,
    'populate[feedback][populate][feedback_question]': true,
    'populate[orientation_detail]': true,
    'populate[prerequisite_courses]': true,
    'populate[quiz][populate][quiz_questions][populate][options]': true,
    'populate[quiz][populate][quiz_instruction]': true,
    'populate[quiz][populate][quiz_instruction_checklist][populate]': '*',
  };
  if (opts.language) params.language = opts.language;

  const response = await api.get(API_ENDPOINTS.COURSES.GET(documentId), { params });
  const raw = response?.data?.data ?? response?.data ?? response;
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

/**
 * Create or update module-video-progress when user marks a module as read.
 * Backend expects: userId, courseId (numeric), moduleIndex, moduleTitle?, videoDurationMin?, timeWatchedMin?
 */
export const markModuleVideoProgress = async ({
  userId,
  courseId,
  moduleIndex,
  moduleTitle = null,
  videoDurationMin = 0,
  timeWatchedMin = 0,
}) => {
  return api.post(API_ENDPOINTS.MODULE_VIDEO_PROGRESS.MARK_AS_READ, {
    userId: Number(userId),
    courseId: Number(courseId),
    moduleIndex: Number(moduleIndex),
    moduleTitle: moduleTitle ?? null,
    videoDurationMin: Number(videoDurationMin) || 0,
    timeWatchedMin: Number(timeWatchedMin) || 0,
  });
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

// Create a backend audit entry that the user acknowledged orientation warning.
export const confirmOrientationAttendance = async ({ userId, courseId, courseDocumentId, language }) => {
  return api.post(API_ENDPOINTS.ORIENTATION.CONFIRM, {
    userId: userId != null ? Number(userId) : null,
    courseId: courseId != null ? Number(courseId) : null,
    courseDocumentId: courseDocumentId ?? null,
    language: language ?? null,
    confirmedAt: new Date().toISOString(),
  });
};

export default {
  fetchAllCourses,
  fetchCourseCategories,
  fetchCourseById,
  confirmOrientationAttendance,
};
