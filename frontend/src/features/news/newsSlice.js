/**
 * News slice: state + async logic. Calls newsAPI and updates the store.
 * Flow: Component → dispatch(loadAllNews) → thunk calls fetchAllNews() → state updates → selector → UI.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAllNews, fetchNewsByCategory } from './newsAPI';

export const loadAllNews = createAsyncThunk(
  'news/loadAllNews',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAllNews();
    } catch (error) {
      return rejectWithValue(error?.message ?? 'Failed to load news');
    }
  }
);

export const loadNewsByCategory = createAsyncThunk(
  'news/loadNewsByCategory',
  async (category) => {
    return await fetchNewsByCategory(category);
  }
);

const initialState = {
  newsList: [],
  filteredNews: [],
  currentCategory: 'all',
  loading: false,
  error: null,
};

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.currentCategory = action.payload;
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
        const news = action.payload?.news ?? [];
        state.newsList = news;
        state.filteredNews = news;
      })
      .addCase(loadAllNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loadNewsByCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadNewsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredNews = action.payload?.news ?? [];
      });
  },
});

export const { setCategory, clearError, resetNewsState } = newsSlice.actions;
export default newsSlice.reducer;
