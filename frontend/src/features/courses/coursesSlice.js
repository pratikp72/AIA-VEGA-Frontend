import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAllCourses, fetchCourseById, fetchAllUserProgress } from './coursesAPI';
import { getCurrentUserId } from '@/lib/auth';

export const loadAllCourses = createAsyncThunk(
  'courses/loadAllCourses',
  async (_, { rejectWithValue }) => {
    try {
      const courses = await fetchAllCourses();
      const userId = getCurrentUserId();
      if (userId) {
        const progressByCourse = await fetchAllUserProgress(userId);
        return courses.map((c) => ({
          ...c,
          completed: progressByCourse[c.id]?.completed ?? c.completed,
          certificationGenerated: progressByCourse[c.id]?.certificate_issued ?? c.certificationGenerated,
          progressStatus: progressByCourse[c.id]?.progress_status ?? null,
          feedbackSubmitted: progressByCourse[c.id]?.feedback_submitted ?? false,
        }));
      }
      return courses;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Load a single course by documentId. Optionally pass language so backend returns only that language's modules/quiz/feedback.
 * @param {string | { documentId: string, language?: string }} arg - documentId string or { documentId, language }.
 */
export const loadCourseById = createAsyncThunk(
  'courses/loadCourseById',
  async (arg, { rejectWithValue }) => {
    try {
      const documentId = typeof arg === 'string' ? arg : arg?.documentId;
      const language = typeof arg === 'object' && arg != null ? arg.language : undefined;
      return await fetchCourseById(documentId, language ? { language } : {});
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Alias for backwards compatibility
export const loadCourseCategories = loadAllCourses;

const initialState = {
  coursesList: [],
  loading: false,
  error: null,
  currentCourse: null,
  courseDetailLoading: false,
  courseDetailError: null,
};

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetCoursesState: () => initialState,
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
      state.courseDetailError = null;
    },
    markModuleAsRead: (state, action) => {
      const { moduleId } = action.payload;
      if (state.currentCourse?.modulesList) {
        const mod = state.currentCourse.modulesList.find(
          m => String(m.moduleId || m.id) === String(moduleId)
        );
        if (mod) mod.mark_as_read = true;
      }
    },
    // Called on course load with the user's completed_modules from user-progress.
    // Uses module_id (moduleId) for matching - stable across fetches, unlike Strapi component id.
    // Also checks mod.id for backward compat with progress stored using old Strapi component ids.
    initializeModuleReadState: (state, action) => {
      const completedIds = action.payload; // string[]
      if (state.currentCourse?.modulesList) {
        state.currentCourse.modulesList.forEach(mod => {
          const byModuleId = mod.moduleId && completedIds.includes(String(mod.moduleId));
          const byId = mod.id != null && completedIds.includes(String(mod.id));
          mod.mark_as_read = byModuleId || byId;
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAllCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAllCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.coursesList = action.payload || [];
      })
      .addCase(loadAllCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loadCourseById.pending, (state) => {
        state.courseDetailLoading = true;
        state.courseDetailError = null;
      })
      .addCase(loadCourseById.fulfilled, (state, action) => {
        state.courseDetailLoading = false;
        state.currentCourse = action.payload;
      })
      .addCase(loadCourseById.rejected, (state, action) => {
        state.courseDetailLoading = false;
        state.courseDetailError = action.payload;
      });
  },
});

export const { clearError, resetCoursesState, clearCurrentCourse, markModuleAsRead, initializeModuleReadState } = coursesSlice.actions;
export default coursesSlice.reducer;
