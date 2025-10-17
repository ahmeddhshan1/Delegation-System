import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { eventService } from '../../services/api'

// Async thunks
export const fetchMainEvents = createAsyncThunk(
  'events/fetchMainEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventService.getMainEvents()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب الأحداث الرئيسية')
    }
  }
)

export const fetchSubEvents = createAsyncThunk(
  'events/fetchSubEvents',
  async (mainEventId, { rejectWithValue }) => {
    try {
      const response = await eventService.getSubEvents(mainEventId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب الأحداث الفرعية')
    }
  }
)

export const createMainEvent = createAsyncThunk(
  'events/createMainEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await eventService.createMainEvent(eventData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في إنشاء الحدث الرئيسي')
    }
  }
)

export const createSubEvent = createAsyncThunk(
  'events/createSubEvent',
  async ({ mainEventId, eventData }, { rejectWithValue }) => {
    try {
      const response = await eventService.createSubEvent(mainEventId, eventData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في إنشاء الحدث الفرعي')
    }
  }
)

export const updateMainEvent = createAsyncThunk(
  'events/updateMainEvent',
  async ({ eventId, eventData }, { rejectWithValue }) => {
    try {
      const response = await eventService.updateMainEvent(eventId, eventData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في تحديث الحدث الرئيسي')
    }
  }
)

export const updateSubEvent = createAsyncThunk(
  'events/updateSubEvent',
  async ({ subEventId, eventData }, { rejectWithValue }) => {
    try {
      const response = await eventService.updateSubEvent(subEventId, eventData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في تحديث الحدث الفرعي')
    }
  }
)

export const deleteMainEvent = createAsyncThunk(
  'events/deleteMainEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      await eventService.deleteMainEvent(eventId)
      return eventId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في حذف الحدث الرئيسي')
    }
  }
)

export const deleteSubEvent = createAsyncThunk(
  'events/deleteSubEvent',
  async (subEventId, { rejectWithValue }) => {
    try {
      await eventService.deleteSubEvent(subEventId)
      return subEventId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في حذف الحدث الفرعي')
    }
  }
)

const initialState = {
  mainEvents: [],
  subEvents: [],
  currentMainEvent: null,
  currentSubEvent: null,
  isLoading: false,
  error: null,
  selectedMainEvent: null,
  selectedSubEvent: null
}

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentMainEvent: (state, action) => {
      state.currentMainEvent = action.payload
      state.selectedMainEvent = action.payload
    },
    setCurrentSubEvent: (state, action) => {
      state.currentSubEvent = action.payload
      state.selectedSubEvent = action.payload
    },
    clearCurrentEvents: (state) => {
      state.currentMainEvent = null
      state.currentSubEvent = null
      state.selectedMainEvent = null
      state.selectedSubEvent = null
    },
    updateMainEventLocal: (state, action) => {
      const index = state.mainEvents.findIndex(event => event.id === action.payload.id)
      if (index !== -1) {
        state.mainEvents[index] = { ...state.mainEvents[index], ...action.payload }
      }
    },
    updateSubEventLocal: (state, action) => {
      const index = state.subEvents.findIndex(event => event.id === action.payload.id)
      if (index !== -1) {
        state.subEvents[index] = { ...state.subEvents[index], ...action.payload }
      }
    },
    removeMainEventLocal: (state, action) => {
      state.mainEvents = state.mainEvents.filter(event => event.id !== action.payload)
    },
    removeSubEventLocal: (state, action) => {
      state.subEvents = state.subEvents.filter(event => event.id !== action.payload)
    },
    addMainEventLocal: (state, action) => {
      state.mainEvents.push(action.payload)
    },
    addSubEventLocal: (state, action) => {
      state.subEvents.push(action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Main Events
      .addCase(fetchMainEvents.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMainEvents.fulfilled, (state, action) => {
        state.isLoading = false
        state.mainEvents = action.payload
        state.error = null
      })
      .addCase(fetchMainEvents.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch Sub Events
      .addCase(fetchSubEvents.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSubEvents.fulfilled, (state, action) => {
        state.isLoading = false
        state.subEvents = action.payload
        state.error = null
      })
      .addCase(fetchSubEvents.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create Main Event
      .addCase(createMainEvent.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createMainEvent.fulfilled, (state, action) => {
        state.isLoading = false
        state.mainEvents.push(action.payload)
        state.error = null
      })
      .addCase(createMainEvent.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create Sub Event
      .addCase(createSubEvent.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createSubEvent.fulfilled, (state, action) => {
        state.isLoading = false
        state.subEvents.push(action.payload)
        state.error = null
      })
      .addCase(createSubEvent.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update Main Event
      .addCase(updateMainEvent.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateMainEvent.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.mainEvents.findIndex(event => event.id === action.payload.id)
        if (index !== -1) {
          state.mainEvents[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateMainEvent.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update Sub Event
      .addCase(updateSubEvent.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateSubEvent.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.subEvents.findIndex(event => event.id === action.payload.id)
        if (index !== -1) {
          state.subEvents[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateSubEvent.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete Main Event
      .addCase(deleteMainEvent.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteMainEvent.fulfilled, (state, action) => {
        state.isLoading = false
        state.mainEvents = state.mainEvents.filter(event => event.id !== action.payload)
        state.error = null
      })
      .addCase(deleteMainEvent.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete Sub Event
      .addCase(deleteSubEvent.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteSubEvent.fulfilled, (state, action) => {
        state.isLoading = false
        state.subEvents = state.subEvents.filter(event => event.id !== action.payload)
        state.error = null
      })
      .addCase(deleteSubEvent.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const {
  clearError,
  setCurrentMainEvent,
  setCurrentSubEvent,
  clearCurrentEvents,
  updateMainEventLocal,
  updateSubEventLocal,
  removeMainEventLocal,
  removeSubEventLocal,
  addMainEventLocal,
  addSubEventLocal
} = eventsSlice.actions

export default eventsSlice.reducer
