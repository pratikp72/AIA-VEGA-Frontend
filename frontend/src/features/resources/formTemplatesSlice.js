import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchFormTemplates, fetchFormTemplateById } from './formTemplatesAPI';

export const loadFormTemplates = createAsyncThunk(
  'formTemplates/loadFormTemplates',
  async ({ page = 1, limit = 10, search = '', date = '', append = false } = {}, { rejectWithValue }) => {
    try {
      const result = await fetchFormTemplates({ page, limit, search, date });
      return { ...result, __append: append };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const loadFormTemplateDetail = createAsyncThunk(
  'formTemplates/loadFormTemplateDetail',
  async (documentId, { rejectWithValue }) => {
    try {
      const result = await fetchFormTemplateById(documentId);
      return result;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  templatesList: [],
  templateDetail: null,
  loading: false,
  error: null,
  meta: {},
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
};

const formTemplatesSlice = createSlice({
  name: 'formTemplates',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetFormTemplatesState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadFormTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFormTemplates.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        const incoming = payload.templates || [];
        const append = payload.__append === true;
        if (append) {
          state.templatesList = Array.isArray(state.templatesList)
            ? state.templatesList.concat(incoming)
            : incoming;
        } else {
          state.templatesList = incoming;
        }
        const pagination = payload.meta?.pagination || {};
        state.currentPage = pagination.page || 1;
        state.totalPages = pagination.pageCount || 1;
        state.totalItems = pagination.total || incoming.length;
        state.meta = payload.meta || {};
      })
      .addCase(loadFormTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load form templates';
      })
      .addCase(loadFormTemplateDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFormTemplateDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.templateDetail = action.payload || null;
      })
      .addCase(loadFormTemplateDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load form template detail';
      });
  },
});

export const { setPage, clearError, resetFormTemplatesState } = formTemplatesSlice.actions;
export default formTemplatesSlice.reducer;
