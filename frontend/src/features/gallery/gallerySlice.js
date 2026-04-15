import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchGalleryByFilters } from './galleryAPI';

function dedupeByStableId(list = []) {
  const seen = new Set();
  const output = [];
  for (const item of list) {
    const key = item?.id ?? item?.documentId;
    if (key == null || seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }
  return output;
}

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
  latestRequestId: null,
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
      .addCase(loadGalleryByFilters.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.latestRequestId = action.meta.requestId;
      })
      .addCase(loadGalleryByFilters.fulfilled, (state, action) => {
        if (state.latestRequestId && state.latestRequestId !== action.meta.requestId) return;
        state.loading = false;
        const payload = action.payload || {};
        const incoming = payload.items ?? [];
        const append = payload.__append === true;
        if (append) {
          const merged = Array.isArray(state.items) ? state.items.concat(incoming) : incoming;
          state.items = dedupeByStableId(merged);
        } else {
          state.items = dedupeByStableId(incoming);
        }
        state.currentPage = payload.currentPage || 1;
        state.totalPages = payload.totalPages || 1;
        state.totalItems = payload.totalItems || 0;
        state.latestRequestId = null;
      })
      .addCase(loadGalleryByFilters.rejected, (state, action) => {
        if (state.latestRequestId && state.latestRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.error = action.payload ?? 'Failed to load gallery';
        state.latestRequestId = null;
      });
  },
});

export const { setCompanyFilter, setPage, clearError, resetGalleryState } = gallerySlice.actions;
export default gallerySlice.reducer;
