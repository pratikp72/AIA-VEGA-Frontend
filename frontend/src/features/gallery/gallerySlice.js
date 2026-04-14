import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchGalleryByFilters } from './galleryAPI';

export const loadGalleryByFilters = createAsyncThunk(
  'gallery/loadGalleryByFilters',
  async ({ append = false, ...filters } = {}, { rejectWithValue }) => {
    try {
      const result = await fetchGalleryByFilters(filters);
      return { ...result, __append: append };
    } catch (err) {
      return rejectWithValue(err?.message ?? 'Failed to load gallery');
    }
  }
);

const initialState = {
  items: [],
  companyFilter: 'AIA',
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  loading: false,
  error: null,
};

const gallerySlice = createSlice({
  name: 'gallery',
  initialState,
  reducers: {
    setCompanyFilter: (state, action) => {
      state.companyFilter = action.payload;
      state.currentPage = 1;
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetGalleryState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadGalleryByFilters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadGalleryByFilters.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        const incoming = payload.items ?? [];
        const append = payload.__append === true;
        if (append) {
          state.items = Array.isArray(state.items) ? state.items.concat(incoming) : incoming;
        } else {
          state.items = incoming;
        }
        state.currentPage = payload.currentPage || 1;
        state.totalPages = payload.totalPages || 1;
        state.totalItems = payload.totalItems || 0;
      })
      .addCase(loadGalleryByFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load gallery';
      });
  },
});

export const { setCompanyFilter, setPage, clearError, resetGalleryState } = gallerySlice.actions;
export default gallerySlice.reducer;
