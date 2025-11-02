import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../plugins/axios';

// Async thunks
export const fetchMainEvents = createAsyncThunk(
  'events/fetchMainEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/main-events/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createMainEvent = createAsyncThunk(
  'events/createMainEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await api.post('/main-events/', eventData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateMainEvent = createAsyncThunk(
  'events/updateMainEvent',
  async ({ id, eventData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/main-events/${id}/`, eventData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteMainEvent = createAsyncThunk(
  'events/deleteMainEvent',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/main-events/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSubEvents = createAsyncThunk(
  'events/fetchSubEvents',
  async (mainEventId, { rejectWithValue }) => {
    try {
      const params = mainEventId ? { main_event_id: mainEventId } : {};
      const response = await api.get('/sub-events/', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createSubEvent = createAsyncThunk(
  'events/createSubEvent',
  async (subEventData, { rejectWithValue }) => {
    try {
      const response = await api.post('/sub-events/', subEventData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateSubEvent = createAsyncThunk(
  'events/updateSubEvent',
  async ({ id, subEventData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/sub-events/${id}/`, subEventData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteSubEvent = createAsyncThunk(
  'events/deleteSubEvent',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/sub-events/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  mainEvents: [],
  subEvents: [],
  loading: false,
  error: null,
  lastUpdate: null
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLastUpdate: (state, action) => {
      state.lastUpdate = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Main Events
    builder
      .addCase(fetchMainEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMainEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.mainEvents = action.payload.results || action.payload;
      })
      .addCase(fetchMainEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createMainEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMainEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.mainEvents.unshift(action.payload);
      })
      .addCase(createMainEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateMainEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMainEvent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.mainEvents.findIndex(event => event.id === action.payload.id);
        if (index !== -1) {
          state.mainEvents[index] = action.payload;
        }
      })
      .addCase(updateMainEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteMainEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMainEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.mainEvents = state.mainEvents.filter(event => event.id !== action.payload);
      })
      .addCase(deleteMainEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Sub Events
      .addCase(fetchSubEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.subEvents = action.payload.results || action.payload;
      })
      .addCase(fetchSubEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSubEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.subEvents.unshift(action.payload);
      })
      .addCase(createSubEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSubEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubEvent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.subEvents.findIndex(event => event.id === action.payload.id);
        if (index !== -1) {
          state.subEvents[index] = action.payload;
        }
      })
      .addCase(updateSubEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteSubEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.subEvents = state.subEvents.filter(event => event.id !== action.payload);
      })
      .addCase(deleteSubEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setLastUpdate } = eventsSlice.actions;
export default eventsSlice.reducer;