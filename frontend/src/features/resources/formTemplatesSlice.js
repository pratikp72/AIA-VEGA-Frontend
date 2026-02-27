import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchFormTemplates, fetchFormTemplateById } from './formTemplatesAPI';

export const loadFormTemplates = createAsyncThunk(
  'formTemplates/loadFormTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const result = await fetchFormTemplates();
      return result;
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
};

const formTemplatesSlice = createSlice({
  name: 'formTemplates',
  initialState,
  reducers: {
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
        state.templatesList = action.payload.templates || [];
        state.meta = action.payload.meta || {};
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

export const { clearError, resetFormTemplatesState } = formTemplatesSlice.actions;
export default formTemplatesSlice.reducer;
