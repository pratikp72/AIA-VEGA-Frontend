import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchResources } from './resourcesAPI';

export const loadResources = createAsyncThunk(
  'resources/loadResources',
  async ({ page = 1, limit = 10, append = false } = {}, { rejectWithValue }) => {
    try {
      const result = await fetchResources(page, limit);
      return { ...result, __append: append };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  resourcesList: [],
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  loading: false,
  error: null,
};

const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetResourcesState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadResources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadResources.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        const incoming = payload.resources || [];
        const append = payload.__append === true;
        if (append) {
          state.resourcesList = Array.isArray(state.resourcesList) ? state.resourcesList.concat(incoming) : incoming;
        } else {
          state.resourcesList = incoming;
        }
        state.totalPages = payload.totalPages ?? state.totalPages;
        state.totalItems = payload.totalItems ?? state.totalItems;
        state.currentPage = payload.currentPage ?? state.currentPage;
      })
      .addCase(loadResources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setPage, clearError, resetResourcesState } = resourcesSlice.actions;
export default resourcesSlice.reducer;
