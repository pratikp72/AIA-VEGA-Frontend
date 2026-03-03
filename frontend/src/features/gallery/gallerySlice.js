import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchGalleryByFilters } from './galleryAPI';

export const loadGalleryByFilters = createAsyncThunk(
  'gallery/loadGalleryByFilters',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const result = await fetchGalleryByFilters(filters);
      return result;
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
        state.items = payload.items ?? [];
      })
      .addCase(loadGalleryByFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load gallery';
      });
  },
});

export const { setCompanyFilter, setPage, clearError, resetGalleryState } = gallerySlice.actions;
export default gallerySlice.reducer;
