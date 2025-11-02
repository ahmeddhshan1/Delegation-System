import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../plugins/axios';

// Async thunk to fetch sub events
export const fetchSubEvents = createAsyncThunk(
  'subEvents/fetchSubEvents',
  async (mainEventId = null, { rejectWithValue }) => {
    try {
      const params = mainEventId ? { main_event_id: mainEventId } : {};
      const response = await api.get('/sub-events/', { params });
      return {
        data: response.data.results || response.data,
        mainEventId
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to create sub event
export const createSubEvent = createAsyncThunk(
  'subEvents/createSubEvent',
  async (subEventData, { rejectWithValue }) => {
    try {
      const response = await api.post('/sub-events/', subEventData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to update sub event
export const updateSubEvent = createAsyncThunk(
  'subEvents/updateSubEvent',
  async ({ id, subEventData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/sub-events/${id}/`, subEventData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to delete sub event
export const deleteSubEvent = createAsyncThunk(
  'subEvents/deleteSubEvent',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/sub-events/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const subEventsSlice = createSlice({
  name: 'subEvents',
  initialState: {
    subEvents: [],
    loading: false,
    error: null,
    lastFetchedMainEventId: null,
  },
  reducers: {
    clearSubEvents: (state) => {
      state.subEvents = [];
      state.error = null;
      state.lastFetchedMainEventId = null;
    },
    addSubEvent: (state, action) => {
      state.subEvents.push(action.payload);
    },
    updateExistingSubEvent: (state, action) => {
      const index = state.subEvents.findIndex(event => event.id === action.payload.id);
      if (index !== -1) {
        state.subEvents[index] = { ...state.subEvents[index], ...action.payload };
      }
    },
    removeSubEvent: (state, action) => {
      state.subEvents = state.subEvents.filter(event => event.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.subEvents = action.payload.data;
        state.lastFetchedMainEventId = action.payload.mainEventId;
      })
      .addCase(fetchSubEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSubEvent.fulfilled, (state, action) => {
        state.subEvents.push(action.payload);
      })
      .addCase(updateSubEvent.fulfilled, (state, action) => {
        const index = state.subEvents.findIndex(event => event.id === action.payload.id);
        if (index !== -1) {
          state.subEvents[index] = action.payload;
        }
      })
      .addCase(deleteSubEvent.fulfilled, (state, action) => {
        state.subEvents = state.subEvents.filter(event => event.id !== action.payload);
      });
  },
});

export const { clearSubEvents, addSubEvent, updateExistingSubEvent, removeSubEvent } = subEventsSlice.actions;
export default subEventsSlice.reducer;
