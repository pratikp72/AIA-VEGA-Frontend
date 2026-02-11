import { configureStore } from '@reduxjs/toolkit';
import homeReducer from '@/features/home/homeSlice';  // ← ADD THIS
import newsReducer from '@/features/news/newsSlice';  // ← ADD THIS
// Import your feature slices here as you create them
// import authReducer from '@/features/auth/authSlice';

export const store = configureStore({
  reducer: {
    home: homeReducer, 
    news: newsReducer, // ← ADD THIS
    // auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;