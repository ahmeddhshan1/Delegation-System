import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../plugins/axios';

// Async thunk to fetch nationalities
export const fetchNationalities = createAsyncThunk(
  'nationalities/fetchNationalities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/nationalities/');
      return response.data.results || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to create nationality
export const createNationality = createAsyncThunk(
  'nationalities/createNationality',
  async (nationalityData, { rejectWithValue }) => {
    try {
      const response = await api.post('/nationalities/', nationalityData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to update nationality
export const updateNationality = createAsyncThunk(
  'nationalities/updateNationality',
  async ({ id, nationalityData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/nationalities/${id}/`, nationalityData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to delete nationality
export const deleteNationality = createAsyncThunk(
  'nationalities/deleteNationality',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/nationalities/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const nationalitiesSlice = createSlice({
  name: 'nationalities',
  initialState: {
    nationalities: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearNationalities: (state) => {
      state.nationalities = [];
      state.error = null;
    },
    addNationality: (state, action) => {
      state.nationalities.push(action.payload);
    },
    updateExistingNationality: (state, action) => {
      const index = state.nationalities.findIndex(nationality => nationality.id === action.payload.id);
      if (index !== -1) {
        state.nationalities[index] = { ...state.nationalities[index], ...action.payload };
      }
    },
    removeNationality: (state, action) => {
      state.nationalities = state.nationalities.filter(nationality => nationality.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNationalities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNationalities.fulfilled, (state, action) => {
        state.loading = false;
        state.nationalities = action.payload;
      })
      .addCase(fetchNationalities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createNationality.fulfilled, (state, action) => {
        state.nationalities.push(action.payload);
      })
      .addCase(updateNationality.fulfilled, (state, action) => {
        const index = state.nationalities.findIndex(nationality => nationality.id === action.payload.id);
        if (index !== -1) {
          state.nationalities[index] = action.payload;
        }
      })
      .addCase(deleteNationality.fulfilled, (state, action) => {
        state.nationalities = state.nationalities.filter(nationality => nationality.id !== action.payload);
      });
  },
});

export const { clearNationalities, addNationality, updateExistingNationality, removeNationality } = nationalitiesSlice.actions;
export default nationalitiesSlice.reducer;
