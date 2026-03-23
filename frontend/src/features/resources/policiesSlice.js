import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPolicies } from './policiesAPI';

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
      .addCase(loadPolicies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadPolicies.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        const incoming = payload.policies || [];
        const append = payload.__append === true;
        if (append) {
          state.policiesList = Array.isArray(state.policiesList) ? state.policiesList.concat(incoming) : incoming;
        } else {
          state.policiesList = incoming;
        }
        state.currentPage = payload.currentPage || 1;
        state.totalPages = payload.totalPages || 1;
        state.totalItems = payload.totalItems || 0;
      })
      .addCase(loadPolicies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load policies';
      });
  },
});

export const { setPage, clearError, resetPoliciesState } = policiesSlice.actions;
export default policiesSlice.reducer;