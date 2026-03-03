import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  locations: [], // List of locations, each with units
  loading: false,
  error: null,
};

const locationSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    setLocations(state, action) {
      state.locations = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setLocations, setLoading, setError } = locationSlice.actions;
export default locationSlice.reducer;
