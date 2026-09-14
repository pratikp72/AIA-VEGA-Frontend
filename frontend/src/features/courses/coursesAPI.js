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
    deadline: course.deadline || null,
    prerequisite_courses: Array.isArray(course.prerequisite_courses)
      ? course.prerequisite_courses
      : course.prerequisite_courses
        ? [course.prerequisite_courses]
        : [],
    active: course.active !== 'unpublished',
  };
}

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.data)) return value.data;
  if (value.data) return [value.data];
  return [value];
}

function toEntityObject(value) {
  if (!value) return null;
  const entity = value?.data ? value.data : value;
  if (!entity) return null;
  const attrs = entity.attributes || {};
  return {
    ...entity,
    ...attrs,
    id: entity.id ?? attrs.id ?? null,
    documentId: entity.documentId ?? attrs.documentId ?? null,
  };
}

function normalizeWorkflowUser(user) {
  const entity = toEntityObject(user);
  if (!entity) return null;
  const id = entity.id ?? null;
  const documentId = entity.documentId ?? null;
  const username = entity.username || '';
  if (id == null && documentId == null && !username) return null;
  return {
    id,
    documentId,
    username,
  };
}

function normalizeWorkflowCourseRef(courseRef) {
  const entity = toEntityObject(courseRef);
  if (!entity) return null;
  const id = entity.id ?? null;
  const documentId = entity.documentId ?? null;
  const title = entity.title || '';
  const category = entity.course_category || entity.category || '';
  if (id == null && documentId == null && !title) return null;
  return {
    id,
    documentId,
    title,
    category,
  };
}

function normalizeWorkflowCourseRefs(courseRefValue) {
  return toArray(courseRefValue)
    .map(normalizeWorkflowCourseRef)
    .filter(Boolean);
}

function normalizeWorkflowOfflineModuleEntry(entry) {
  const entity = toEntityObject(entry) || entry;
  if (!entity) return null;
  return {
    id: entity.id ?? null,
    username: entity.username || '',
    score: entity.score ?? null,
    attempt: entity.attempt ?? null,
    description: entity.description ?? null,
    attachment: entity.attachment ?? null,
  };
}

function normalizeWorkflowModule(module, index) {
  const entity = toEntityObject(module) || module;
  if (!entity) return null;
  const courseRefs = normalizeWorkflowCourseRefs(entity.course);
  const offlineModules = toArray(entity.offline_module)
    .map(normalizeWorkflowOfflineModuleEntry)
    .filter(Boolean);
  let prerequisiteModule = entity.prerequisite_modules ?? null;
  if (Array.isArray(prerequisiteModule)) {
    prerequisiteModule = prerequisiteModule[0] ?? null;
  }
  return {
    id: entity.id ?? null,
    documentId: entity.documentId ?? null,
    moduleIndex: typeof index === 'number' ? index : null,
    moduleType: entity.module_type || '',
    course: courseRefs[0] || null,
    courseRefs,
    courseCount: Number.isFinite(Number(entity?.course?.count)) ? Number(entity.course.count) : null,
    offlineModules,
    prerequisiteModule,
  };
}

function workflowManagerName(createdBy) {
  const entity = toEntityObject(createdBy);
  if (!entity) return '';
  const fullName = [entity.firstname, entity.lastname].filter(Boolean).join(' ').trim();
  return fullName || entity.username || entity.email || '';
}

function normalizeCourseWorkflow(workflow) {
  const entity = toEntityObject(workflow) || workflow;
  if (!entity) return null;
  const usersRaw = entity.users_permissions_users;
  const modules = toArray(entity.modules)
    .map((module, index) => normalizeWorkflowModule(module, index))
    .filter(Boolean);

  return {
    id: entity.id ?? null,
    documentId: entity.documentId ?? null,
    category: String(entity.category || '').toLowerCase(),
    users: toArray(usersRaw)
      .map(normalizeWorkflowUser)
      .filter(Boolean),
    usersCount: Number.isFinite(Number(usersRaw?.count)) ? Number(usersRaw.count) : null,
    modules,
    managerName: workflowManagerName(entity.createdBy),
  };
}

const COURSES_LIST_PARAMS = {
  'populate[thumbnail]': true,
  'populate[quiz][populate][quiz_questions][populate][options]': true,
  'populate[modules]': true,
  'populate[prerequisite_courses]': true,
  
  'pagination[pageSize]': 50,
  sort: 'createdAt:desc',
};

export const fetchAllCourses = async ({ page = 1, pageSize = 9 } = {}) => {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    const items = MOCK_COURSE_CATEGORIES;
    return {
      items,
      totalCount: items.length,
      totalPages: 1,
      currentPage: 1,
    };
  }
  const response = await api.get(API_ENDPOINTS.COURSES.LIST, {
    params: {
      ...COURSES_LIST_PARAMS,
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
    },
  });
  const data = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);

  const items = data
    .filter(c => c.active !== 'unpublished')
    .map((course) => normalizeCourse(course));
  const meta = response?.meta?.pagination || {};
  return {
    items,
    totalCount: meta.total || items.length,
    totalPages: meta.pageCount || 1,
    currentPage: meta.page || page,
  };
};

const COURSE_WORKFLOWS_LIST_PARAMS = {
  'populate[users_permissions_users]': true,
  'populate[modules][populate][course]': true,
  'populate[modules][populate][offline_module]': true,
  'populate[createdBy][fields][0]': 'firstname',
  'populate[createdBy][fields][1]': 'lastname',
  'populate[createdBy][fields][2]': 'username',
  'pagination[pageSize]': 50,
  sort: 'createdAt:desc',
};

export const fetchCourseWorkflows = async (opts = {}) => {
  const all = [];
  let page = 1;
  let pageCount = 1;

  do {
    const response = await api.get('/course-workflows', {
      params: {
        ...COURSE_WORKFLOWS_LIST_PARAMS,
        'pagination[page]': page,
        ...(opts.fresh ? { _t: Date.now() } : {}),
      },
    });
    const data = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response)
        ? response
        : [];
    all.push(...data);
    pageCount = response?.meta?.pagination?.pageCount ?? 1;
    page += 1;
  } while (page <= pageCount);

  return all.map(normalizeCourseWorkflow).filter(Boolean);
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
    'populate[prerequisite_courses]': true,
    'populate[quiz][populate][quiz_questions][populate][options]': true,
    'populate[quiz][populate][quiz_instruction]': true,
    'populate[quiz][populate][quiz_instruction][populate][checklist]': true,
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

export const markModuleProgress = async ({ userId, courseId, moduleId, timeSpentMinutes = 0, selectedLanguage = null, startedAt = null }) => {
  return api.post('/user-progress/mark-module', {
    userId,
    courseId,
    moduleId,
    last_accessed_at: new Date().toISOString(),
    time_spent_minutes: Number(timeSpentMinutes) || 0,
    selected_language: selectedLanguage || null,
    // Only sent on the very first module mark (course not yet started)
    ...(startedAt ? { started_at: startedAt } : {}),
  });
};

/**
 * Transition a course to In_progress without marking any module complete.
 * Called when the user first engages with content (video play, View Full Content).
 */
export const startCourse = async ({ userId, courseId, language }) => {
  return api.post('/user-progress/start-course', {
    userId: Number(userId),
    courseId,
    language,
  });
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
  videoCompletionType = 'full_watch',
}) => {
  const normalizedUserId = Number(userId);
  const normalizedCourseId = Number(courseId);

  if (!Number.isFinite(normalizedUserId) || !Number.isFinite(normalizedCourseId)) {
    throw new Error('markModuleVideoProgress requires numeric userId and courseId');
  }

  return api.post(API_ENDPOINTS.MODULE_VIDEO_PROGRESS.MARK_AS_READ, {
    userId: normalizedUserId,
    courseId: normalizedCourseId,
    course_id: normalizedCourseId,
    course: normalizedCourseId,
    moduleIndex: Number(moduleIndex),
    moduleTitle: moduleTitle ?? null,
    videoDurationMin: Number(videoDurationMin) || 0,
    timeWatchedMin: Number(timeWatchedMin) || 0,
    video_completion_type: videoCompletionType,
    last_updated: new Date().toISOString(),
  });
};

// Returns completed module IDs and progress status for this user+course.
// Falls back to empty on any error so the UI stays functional.
// Pass { fresh: true } to bypass GET deduplication cache (use after mutations like mark-as-read).
const EMPTY_COURSE_PROGRESS = {
  completedModules: [],
  progressStatus: null,
  feedbackSubmitted: false,
  progressPercentage: 0,
  selectedLanguage: null,
  dueDate: null,
};

function unwrapProgressRecord(entry) {
  if (!entry || typeof entry !== 'object') return entry;
  const attrs = entry.attributes && typeof entry.attributes === 'object' ? entry.attributes : {};
  const inner = entry.data && typeof entry.data === 'object' && !Array.isArray(entry.data) ? entry.data : {};
  const innerAttrs = inner.attributes && typeof inner.attributes === 'object' ? inner.attributes : {};
  return {
    ...inner,
    ...innerAttrs,
    ...entry,
    ...attrs,
    id: entry.id ?? inner.id ?? attrs.id ?? innerAttrs.id,
    documentId: entry.documentId ?? attrs.documentId ?? inner.documentId ?? innerAttrs.documentId,
  };
}

function resolveProgressCourseRef(record, fallbackKey) {
  const courseRef = record?.course;
  if (typeof courseRef === 'number' || typeof courseRef === 'string') {
    return { courseId: courseRef, documentId: null };
  }
  if (courseRef && typeof courseRef === 'object') {
    return {
      courseId: courseRef.id ?? record?.courseId ?? record?.course_id ?? fallbackKey ?? null,
      documentId: courseRef.documentId ?? null,
    };
  }
  return {
    courseId: record?.courseId ?? record?.course_id ?? fallbackKey ?? null,
    documentId: null,
  };
}

function normalizeProgressRecord(entry) {
  const unwrapped = unwrapProgressRecord(entry);
  const completedRaw = unwrapped?.completed_modules ?? unwrapped?.completedModules;
  const dueDate = unwrapped?.due_date ?? unwrapped?.dueDate ?? null;
  return {
    ...unwrapped,
    completed_modules: Array.isArray(completedRaw) ? completedRaw.map(String) : [],
    progress_status: unwrapped?.progress_status ?? unwrapped?.progressStatus ?? null,
    progress_percentage: Number(unwrapped?.progress_percentage ?? unwrapped?.progressPercentage ?? 0) || 0,
    due_date: dueDate,
    dueDate,
  };
}

export function lookupProgressByCourse(progressMap, course) {
  if (!progressMap || !course) return null;
  const keys = [course.id, course.documentId].filter((value) => value != null).map(String);
  for (const key of keys) {
    if (progressMap[key]) return progressMap[key];
  }
  return null;
}

export function toProgressEntryFromCourseProgress(progress) {
  if (!progress) return null;
  return {
    progress_status: progress.progressStatus ?? progress.progress_status ?? null,
    progress_percentage: Number(progress.progressPercentage ?? progress.progress_percentage ?? 0) || 0,
    completed_modules: progress.completedModules ?? progress.completed_modules ?? [],
    due_date: progress.dueDate ?? progress.due_date ?? null,
    dueDate: progress.dueDate ?? progress.due_date ?? null,
  };
}

export function computeDashboardCourseProgress(progressEntry, courseModules = []) {
  const totalLessons = courseModules.length;
  if (!progressEntry) {
    return {
      progress: 0,
      completedLessons: 0,
      totalLessons,
      progressStatus: null,
      dueDate: null,
    };
  }

  const completedModules = progressEntry.completed_modules ?? progressEntry.completedModules ?? [];
  const statusNorm = String(
    progressEntry.progress_status ?? progressEntry.progressStatus ?? ''
  ).trim().toLowerCase();
  const progressFromApi = Math.min(
    100,
    Math.max(0, Math.round(Number(
      progressEntry.progress_percentage ?? progressEntry.progressPercentage ?? 0
    )))
  );
  const completedLessonsById = courseModules.filter((module) =>
    completedModules.includes(String(module.id)) ||
    (module.module_id && completedModules.includes(String(module.module_id))) ||
    (module.moduleId && completedModules.includes(String(module.moduleId)))
  ).length;

  let progress = 0;
  let completedLessons = completedLessonsById;

  if (statusNorm === 'completed') {
    progress = 100;
    completedLessons = totalLessons;
  } else if (progressFromApi > 0) {
    progress = progressFromApi;
    completedLessons = totalLessons > 0
      ? Math.min(totalLessons, Math.round((progressFromApi / 100) * totalLessons))
      : completedLessonsById;
  } else {
    progress = totalLessons > 0
      ? Math.min(100, Math.round((completedLessonsById / totalLessons) * 100))
      : 0;
    completedLessons = completedLessonsById;
  }

  return {
    progress,
    completedLessons,
    totalLessons,
    progressStatus: progressEntry.progress_status ?? null,
    dueDate: progressEntry.due_date ?? progressEntry.dueDate ?? null,
  };
}

export const fetchUserCourseProgress = async (userId, courseNumericId, opts = {}) => {
  if (!userId || !courseNumericId) {
    return { ...EMPTY_COURSE_PROGRESS };
  }
  try {
    const params = { userId, courseId: courseNumericId };
    if (opts.fresh) params._t = Date.now(); // bypass dedupe cache
    const response = await api.get('/user-progress/progress', { params });
    const data = normalizeProgressRecord(response?.data || response);
    const completedModules = data.completed_modules ?? [];
    const feedbackSubmitted = !!(data?.feedback_submission ?? data?.feedbackSubmission);
    const progressPercentage = data.progress_percentage ?? 0;
    const selectedLanguage = data?.selected_language ?? data?.selectedLanguage ?? null;
    return {
      completedModules,
      progressStatus: data?.progress_status ?? null,
      feedbackSubmitted,
      progressPercentage,
      selectedLanguage,
      dueDate: data?.due_date ?? data?.dueDate ?? null,
    };
  } catch {
    return { ...EMPTY_COURSE_PROGRESS };
  }
};

function indexProgressByCourseId(raw) {
  const map = {};
  const setEntry = (courseId, documentId, entry) => {
    if (!entry || typeof entry !== 'object') return;
    const normalized = normalizeProgressRecord(entry);
    if (courseId != null) map[String(courseId)] = normalized;
    if (documentId != null && String(documentId) !== String(courseId)) {
      map[String(documentId)] = normalized;
    }
  };
  const data = raw?.data ?? raw;
  if (Array.isArray(data)) {
    for (const entry of data) {
      const record = unwrapProgressRecord(entry);
      const { courseId, documentId } = resolveProgressCourseRef(record);
      setEntry(courseId, documentId, record);
    }
  } else if (data && typeof data === 'object') {
    Object.entries(data).forEach(([key, entry]) => {
      const record = unwrapProgressRecord(entry);
      const { courseId, documentId } = resolveProgressCourseRef(record, key);
      setEntry(courseId, documentId, record);
    });
  }
  return map;
}

// Returns all user progress keyed by course id (for course list completion badges and per-user due dates).
export const fetchAllUserProgress = async (userId) => {
  if (!userId) return {};
  try {
    const res = await api.get('/user-progress/all', { params: { userId } });
    return indexProgressByCourseId(res);
  } catch {
    return {};
  }
};

export const fetchCourseCategories = fetchAllCourses;

export default {
  fetchAllCourses,
  fetchCourseWorkflows,
  fetchCourseCategories,
  fetchCourseById,
};
