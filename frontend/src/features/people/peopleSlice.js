import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPeople, fetchPeopleOptions } from './peopleAPI';

// Fetch paginated + filtered people from backend
export const loadPeople = createAsyncThunk(
  'people/loadPeople',
  async (filters = {}, { rejectWithValue }) => {
    try {
      return await fetchPeople(filters);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch dropdown options (departments, locations) for the selected company
export const loadPeopleOptions = createAsyncThunk(
  'people/loadPeopleOptions',
  async (company = '', { rejectWithValue }) => {
    try {
      return await fetchPeopleOptions(company);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  peopleList: [],
  totalPages: 1,
  totalCount: 0,
  companyFilter: 'AIA',
  currentPage: 1,
  departmentOptions: [],
  locationOptions: [],
  loading: false,
  optionsLoading: false,
  error: null,
};

const peopleSlice = createSlice({
  name: 'people',
  initialState,
  reducers: {
    setCompanyFilter: (state, action) => {
      state.companyFilter = action.payload;
      state.currentPage = 1;
      // Clear options so they reload for the new company
      state.departmentOptions = [];
      state.locationOptions = [];
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
      // loadPeople
      .addCase(loadPeople.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadPeople.fulfilled, (state, action) => {
        state.loading = false;
        state.peopleList = action.payload.items || [];
        state.totalPages = action.payload.totalPages || 1;
        state.totalCount = action.payload.totalCount || 0;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(loadPeople.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // loadPeopleOptions
      .addCase(loadPeopleOptions.pending, (state) => {
        state.optionsLoading = true;
      })
      .addCase(loadPeopleOptions.fulfilled, (state, action) => {
        state.optionsLoading = false;
        state.departmentOptions = action.payload.departments || [];
        state.locationOptions = action.payload.locations || [];
      })
      .addCase(loadPeopleOptions.rejected, (state) => {
        state.optionsLoading = false;
      });
  },
});

export const { setCompanyFilter, setPage, clearError, resetPeopleState } = peopleSlice.actions;
export default peopleSlice.reducer;
