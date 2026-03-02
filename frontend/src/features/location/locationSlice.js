import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  plants: [], // List of plants with units
  selectedPlantId: null,
  units: [], // Units for selected plant
  loading: false,
  error: null,
};

const locationSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    setPlants(state, action) {
      state.plants = action.payload;
    },
    setSelectedPlantId(state, action) {
      state.selectedPlantId = action.payload;
    },
    setUnits(state, action) {
      state.units = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setPlants, setSelectedPlantId, setUnits, setLoading, setError } = locationSlice.actions;
export default locationSlice.reducer;
