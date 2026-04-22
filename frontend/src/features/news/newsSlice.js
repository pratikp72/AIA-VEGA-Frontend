/**
 * News slice: state + async logic. Calls newsAPI and updates the store.
 * Flow: Component → dispatch(loadAllNews) → thunk calls fetchAllNews() → state updates → selector → UI.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAllNews, fetchNewsByCategory } from './newsAPI';

export const loadAllNews = createAsyncThunk(
  'news/loadAllNews',
  async ({ page = 1, pageSize = 9 } = {}, { rejectWithValue }) => {
    try {
      return await fetchAllNews({ page, pageSize });
    } catch (error) {
      return rejectWithValue(error?.message ?? 'Failed to load news');
    }
  }
);

export const loadNewsByCategory = createAsyncThunk(
  'news/loadNewsByCategory',
  async ({ category, page = 1, pageSize = 9 } = {}, { rejectWithValue }) => {
    try {
      return await fetchNewsByCategory(category, { page, pageSize });
    } catch (error) {
      return rejectWithValue(error?.message ?? 'Failed to load news by category');
    }
  }
);

const initialState = {
  newsList: [],
  totalPages: 1,
  totalCount: 0,
  currentPage: 1,
  currentCategory: 'All Categories',
  loading: false,
  error: null,
};

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.currentCategory = action.payload;
      state.currentPage = 1;
      state.newsList = [];
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetNewsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAllNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAllNews.fulfilled, (state, action) => {
        state.loading = false;
        const incomingItems = action.payload.items || [];
        const currentPage = action.payload.currentPage || 1;
        
        // If it's page 1 or not appending, replace; otherwise append
        if (currentPage === 1) {
          state.newsList = incomingItems;
        } else {
          const seen = new Set(state.newsList.map((n) => String(n.id || n.documentId)));
          for (const item of incomingItems) {
            const idKey = String(item?.id || item?.documentId);
            if (seen.has(idKey)) continue;
            seen.add(idKey);
            state.newsList.push(item);
          }
        }
        
        state.totalPages = action.payload.totalPages || 1;
        state.totalCount = action.payload.totalCount || 0;
        state.currentPage = currentPage;
      })
      .addCase(loadAllNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loadNewsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadNewsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        const incomingItems = action.payload.items || [];
        const currentPage = action.payload.currentPage || 1;
        
        // If it's page 1 or not appending, replace; otherwise append
        if (currentPage === 1) {
          state.newsList = incomingItems;
        } else {
          const seen = new Set(state.newsList.map((n) => String(n.id || n.documentId)));
          for (const item of incomingItems) {
            const idKey = String(item?.id || item?.documentId);
            if (seen.has(idKey)) continue;
            seen.add(idKey);
            state.newsList.push(item);
          }
        }
        
        state.totalPages = action.payload.totalPages || 1;
        state.totalCount = action.payload.totalCount || 0;
        state.currentPage = currentPage;
      })
      .addCase(loadNewsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCategory, setPage, clearError, resetNewsState } = newsSlice.actions;
export default newsSlice.reducer;
