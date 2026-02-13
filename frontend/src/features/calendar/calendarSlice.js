import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCalendarEvents } from './calendarAPI';

export const loadCalendarEvents = createAsyncThunk('calendar/loadCalendarEvents', async (_, { rejectWithValue }) => {
  try {
    const res = await fetchCalendarEvents();
    return res.events || [];
  } catch (e) {
    return rejectWithValue(e.message || 'Failed to load calendar events');
  }
});

const initialState = {
  events: [],
  loading: false,
  error: null,
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    clearCalendarError: (state) => {
      state.error = null;
    },
    resetCalendar: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCalendarEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCalendarEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload || [];
      })
      .addCase(loadCalendarEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      });
  },
});

export const { clearCalendarError, resetCalendar } = calendarSlice.actions;
export default calendarSlice.reducer;
