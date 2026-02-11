import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  fetchDashboardData, 
  fetchNewsCarousel, 
  fetchQuickLinks,
  fetchUpcomingEvents,
  fetchNewJoinees,
  fetchMyCourses,
  fetchBirthdaysToday,
  fetchWorkAnniversaries 
} from './homeAPI';

// Async Thunks
export const loadDashboardData = createAsyncThunk(
  'home/loadDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchDashboardData();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadNewsCarousel = createAsyncThunk(
  'home/loadNewsCarousel',
  async () => await fetchNewsCarousel()
);

export const loadQuickLinks = createAsyncThunk(
  'home/loadQuickLinks',
  async () => await fetchQuickLinks()
);

export const loadUpcomingEvents = createAsyncThunk(
  'home/loadUpcomingEvents',
  async () => await fetchUpcomingEvents()
);

export const loadNewJoinees = createAsyncThunk(
  'home/loadNewJoinees',
  async () => await fetchNewJoinees()
);

export const loadMyCourses = createAsyncThunk(
  'home/loadMyCourses',
  async () => await fetchMyCourses()
);

export const loadBirthdaysToday = createAsyncThunk(
  'home/loadBirthdaysToday',
  async () => await fetchBirthdaysToday()
);

export const loadWorkAnniversaries = createAsyncThunk(
  'home/loadWorkAnniversaries',
  async () => await fetchWorkAnniversaries()
);

// Initial State
const initialState = {
  newsCarousel: [],
  quickLinks: [],
  upcomingEvents: [],
  newJoinees: [],
  myCourses: [],
  birthdaysToday: [],
  workAnniversaries: [],
  
  loading: {
    dashboard: false,
    news: false,
    events: false,
    joinees: false,
    courses: false,
    birthdays: false,
    anniversaries: false,
  },
  
  error: null,
};

// Slice
const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetHomeState: () => initialState,
  },
  extraReducers: (builder) => {
    // Dashboard Data
    builder
      .addCase(loadDashboardData.pending, (state) => {
        state.loading.dashboard = true;
        state.error = null;
      })
      .addCase(loadDashboardData.fulfilled, (state, action) => {
        state.loading.dashboard = false;
        // Populate all dashboard data
        state.newsCarousel = action.payload.news || [];
        state.quickLinks = action.payload.quickLinks || [];
        state.upcomingEvents = action.payload.events || [];
        state.newJoinees = action.payload.newJoinees || [];
        state.myCourses = action.payload.courses || [];
        state.birthdaysToday = action.payload.birthdays || [];
        state.workAnniversaries = action.payload.anniversaries || [];
      })
      .addCase(loadDashboardData.rejected, (state, action) => {
        state.loading.dashboard = false;
        state.error = action.payload;
      });

    // News Carousel
    builder
      .addCase(loadNewsCarousel.pending, (state) => {
        state.loading.news = true;
      })
      .addCase(loadNewsCarousel.fulfilled, (state, action) => {
        state.loading.news = false;
        state.newsCarousel = action.payload;
      })
      .addCase(loadNewsCarousel.rejected, (state) => {
        state.loading.news = false;
      });

    // Quick Links
    builder
      .addCase(loadQuickLinks.fulfilled, (state, action) => {
        state.quickLinks = action.payload;
      });

    // Upcoming Events
    builder
      .addCase(loadUpcomingEvents.pending, (state) => {
        state.loading.events = true;
      })
      .addCase(loadUpcomingEvents.fulfilled, (state, action) => {
        state.loading.events = false;
        state.upcomingEvents = action.payload;
      });

    // New Joinees
    builder
      .addCase(loadNewJoinees.pending, (state) => {
        state.loading.joinees = true;
      })
      .addCase(loadNewJoinees.fulfilled, (state, action) => {
        state.loading.joinees = false;
        state.newJoinees = action.payload;
      });

    // My Courses
    builder
      .addCase(loadMyCourses.pending, (state) => {
        state.loading.courses = true;
      })
      .addCase(loadMyCourses.fulfilled, (state, action) => {
        state.loading.courses = false;
        state.myCourses = action.payload;
      });

    // Birthdays Today
    builder
      .addCase(loadBirthdaysToday.fulfilled, (state, action) => {
        state.birthdaysToday = action.payload;
      });

    // Work Anniversaries
    builder
      .addCase(loadWorkAnniversaries.fulfilled, (state, action) => {
        state.workAnniversaries = action.payload;
      });
  },
});

export const { clearError, resetHomeState } = homeSlice.actions;
export default homeSlice.reducer;