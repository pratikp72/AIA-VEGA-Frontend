import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchSocialMedias } from './socialMediaAPI';

function dedupeByStableId(list = []) {
  const seen = new Set();
  const output = [];
  for (const item of list) {
    const key = item?.documentId ?? item?.id;
    if (key == null || seen.has(String(key))) continue;
    seen.add(String(key));
    output.push(item);
  }
  return output;
}

export const loadSocialMedias = createAsyncThunk(
  'socialMedia/loadSocialMedias',
  async ({ page = 1, pageSize = 24, search = '', append = false } = {}, { rejectWithValue }) => {
    try {
      const result = await fetchSocialMedias({ page, pageSize, search });
      return { ...result, __append: append };
    } catch (err) {
      return rejectWithValue(err?.message ?? 'Failed to load social media');
    }
  }
);

const initialState = {
  list: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  latestRequestId: null,
};

const socialMediaSlice = createSlice({
  name: 'socialMedia',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetSocialMediaState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSocialMedias.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.latestRequestId = action.meta.requestId;
      })
      .addCase(loadSocialMedias.fulfilled, (state, action) => {
        if (state.latestRequestId && state.latestRequestId !== action.meta.requestId) return;
        state.loading = false;
        const payload = action.payload || {};
        const incoming = payload.items || [];
        const append = payload.__append === true;
        state.list = append
          ? dedupeByStableId([...(state.list || []), ...incoming])
          : dedupeByStableId(incoming);
        state.currentPage = payload.currentPage || 1;
        state.totalPages = payload.totalPages || 1;
        state.totalCount = payload.totalCount || incoming.length;
        state.latestRequestId = null;
      })
      .addCase(loadSocialMedias.rejected, (state, action) => {
        if (state.latestRequestId && state.latestRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.error = action.payload || 'Failed to load social media';
        state.latestRequestId = null;
      });
  },
});

export const { setPage, clearError, resetSocialMediaState } = socialMediaSlice.actions;
export default socialMediaSlice.reducer;
