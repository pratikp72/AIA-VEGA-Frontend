import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchGallery } from './galleryAPI';

export const loadGallery = createAsyncThunk(
  'gallery/loadGallery',
  async ({ page = 1, limit = 12, append = false } = {}, { rejectWithValue }) => {
    try {
      const result = await fetchGallery(page, limit);
      return { ...result, __append: append };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  items: [],
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
      .addCase(loadGallery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadGallery.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        const incoming = payload.items || [];
        const append = payload.__append === true;
        if (append) {
          state.items = Array.isArray(state.items) ? state.items.concat(incoming) : incoming;
        } else {
          state.items = incoming;
        }
        state.totalPages = payload.totalPages ?? state.totalPages;
        state.totalItems = payload.totalItems ?? state.totalItems;
        state.currentPage = payload.currentPage ?? state.currentPage;
      })
      .addCase(loadGallery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setPage, clearError, resetGalleryState } = gallerySlice.actions;
export default gallerySlice.reducer;
