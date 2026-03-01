import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAllCourses, fetchCourseById } from './coursesAPI';

export const loadAllCourses = createAsyncThunk(
  'courses/loadAllCourses',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAllCourses();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadCourseById = createAsyncThunk(
  'courses/loadCourseById',
  async (documentId, { rejectWithValue }) => {
    try {
      return await fetchCourseById(documentId);
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
        const mod = state.currentCourse.modulesList.find(m => m.id === moduleId);
        if (mod) mod.mark_as_read = true;
      }
    },
    // Called on course load with the user's completed_modules from user-progress.
    // Resets all mark_as_read to false first, then sets true for completed ones.
    initializeModuleReadState: (state, action) => {
      const completedIds = action.payload; // string[]
      if (state.currentCourse?.modulesList) {
        state.currentCourse.modulesList.forEach(mod => {
          mod.mark_as_read = completedIds.includes(String(mod.id));
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
        state.currentCourse = null;
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
