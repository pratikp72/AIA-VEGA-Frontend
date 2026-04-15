import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPolicies } from './policiesAPI';

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

export const loadPolicies = createAsyncThunk(
  'policies/loadPolicies',
  async ({ page = 1, limit = 10, search = '', date = '', append = false } = {}, { rejectWithValue }) => {
    try {
      const result = await fetchPolicies({ page, limit, search, date });
      return { ...result, __append: append };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  policiesList: [],
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  loading: false,
  error: null,
  latestRequestId: null,
};

const policiesSlice = createSlice({
  name: 'policies',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetPoliciesState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPolicies.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.latestRequestId = action.meta.requestId;
      })
      .addCase(loadPolicies.fulfilled, (state, action) => {
        if (state.latestRequestId && state.latestRequestId !== action.meta.requestId) return;
        state.loading = false;
        const payload = action.payload || {};
        const incoming = payload.policies || [];
        const append = payload.__append === true;
        if (append) {
          const merged = Array.isArray(state.policiesList) ? state.policiesList.concat(incoming) : incoming;
          state.policiesList = dedupeByStableId(merged);
        } else {
          state.policiesList = dedupeByStableId(incoming);
        }
        state.currentPage = payload.currentPage || 1;
        state.totalPages = payload.totalPages || 1;
        state.totalItems = payload.totalItems || 0;
        state.latestRequestId = null;
      })
      .addCase(loadPolicies.rejected, (state, action) => {
        if (state.latestRequestId && state.latestRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.error = action.payload || 'Failed to load policies';
        state.latestRequestId = null;
      });
  },
});

export const { setPage, clearError, resetPoliciesState } = policiesSlice.actions;
export default policiesSlice.reducer;