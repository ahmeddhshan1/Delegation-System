import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../plugins/axios';

// Async thunk to fetch dashboard stats
export const fetchStats = createAsyncThunk(
  'stats/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/stats/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const statsSlice = createSlice({
  name: 'stats',
  initialState: {
    delegation_stats: {
      total_delegations: 0,
      military_delegations: 0,
      civilian_delegations: 0
    },
    member_stats: {
      total_members: 0
    },
    event_stats: {
      total_main_events: 0,
      total_sub_events: 0,
      total_delegations: 0,
      total_members: 0
    },
    loading: false,
    error: null,
  },
  reducers: {
    clearStats: (state) => {
      state.delegation_stats = {
        total_delegations: 0,
        military_delegations: 0,
        civilian_delegations: 0
      };
      state.member_stats = {
        total_members: 0
      };
      state.event_stats = {
        total_main_events: 0,
        total_sub_events: 0,
        total_delegations: 0,
        total_members: 0
      };
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.loading = false;
        state.delegation_stats = action.payload.delegation_stats || state.delegation_stats;
        state.member_stats = action.payload.member_stats || state.member_stats;
        state.event_stats = action.payload.event_stats || state.event_stats;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStats } = statsSlice.actions;
export default statsSlice.reducer;
