import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCourseCategories } from './coursesAPI';

export const loadCourseCategories = createAsyncThunk(
  'courses/loadCourseCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchCourseCategories();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  categories: [],
  loading: false,
  error: null,
};

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetCoursesState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCourseCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCourseCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload || [];
      })
      .addCase(loadCourseCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetCoursesState } = coursesSlice.actions;
export default coursesSlice.reducer;
