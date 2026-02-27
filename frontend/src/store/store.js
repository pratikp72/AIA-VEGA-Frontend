import { configureStore } from '@reduxjs/toolkit';
import homeReducer from '@/features/home/homeSlice';  // ← ADD THIS
import newsReducer from '@/features/news/newsSlice';  // ← ADD THIS
import peopleReducer from '@/features/people/peopleSlice';
import resourcesReducer from '@/features/resources/resourcesSlice';
import policiesReducer from '@/features/resources/policiesSlice';
import formTemplatesReducer from '@/features/resources/formTemplatesSlice';
import galleryReducer from '@/features/gallery/gallerySlice';
import coursesReducer from '@/features/courses/coursesSlice';

// Import your feature slices here as you create them
// import authReducer from '@/features/auth/authSlice';

export const store = configureStore({
  reducer: {
    home: homeReducer, 
    news: newsReducer, // ← ADD THIS
    people: peopleReducer,
    resources: resourcesReducer,
    policies: policiesReducer,
    formTemplates: formTemplatesReducer,
    gallery: galleryReducer,
    courses: coursesReducer,
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