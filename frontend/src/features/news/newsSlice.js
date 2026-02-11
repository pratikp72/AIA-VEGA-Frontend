import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAllNews, fetchNewsByCategory } from './newsAPI';

// Async Thunks
export const loadAllNews = createAsyncThunk(
  'news/loadAllNews',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      return await fetchAllNews(page, limit);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadNewsByCategory = createAsyncThunk(
  'news/loadNewsByCategory',
  async ({ category, page = 1, limit = 10 }) => {
    return await fetchNewsByCategory(category, page, limit);
  }
);

// Initial State
const initialState = {
  newsList: [],
  filteredNews: [],
  currentCategory: 'all',
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  loading: false,
  error: null,
};

// Slice
const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.currentCategory = action.payload;
      state.currentPage = 1;
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
    // Load All News
    builder
      .addCase(loadAllNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAllNews.fulfilled, (state, action) => {
        state.loading = false;
        state.newsList = action.payload.news;
        state.filteredNews = action.payload.news;
        state.totalPages = action.payload.totalPages;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(loadAllNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Load By Category
    builder
      .addCase(loadNewsByCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadNewsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredNews = action.payload.news;
        state.totalPages = action.payload.totalPages;
        state.totalItems = action.payload.totalItems;
      });
  },
});

export const { setCategory, setPage, clearError, resetNewsState } = newsSlice.actions;
export default newsSlice.reducer;