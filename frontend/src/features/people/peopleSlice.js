import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPeople } from './peopleAPI';

export const loadPeople = createAsyncThunk(
  'people/loadPeople',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchPeople();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  peopleList: [],
  companyFilter: 'AIA',
  currentPage: 1,
  loading: false,
  error: null,
};

const peopleSlice = createSlice({
  name: 'people',
  initialState,
  reducers: {
    setCompanyFilter: (state, action) => {
      state.companyFilter = action.payload;
      state.currentPage = 1;
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetPeopleState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPeople.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadPeople.fulfilled, (state, action) => {
        state.loading = false;
        state.peopleList = action.payload || [];
      })
      .addCase(loadPeople.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCompanyFilter, setPage, clearError, resetPeopleState } = peopleSlice.actions;
export default peopleSlice.reducer;
