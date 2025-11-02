import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../plugins/axios'

// Async thunks for airlines
export const fetchAirlines = createAsyncThunk(
  'airlines/fetchAirlines',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/airlines/')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب شركات الطيران')
    }
  }
)

export const createAirline = createAsyncThunk(
  'airlines/createAirline',
  async (airlineData, { rejectWithValue }) => {
    try {
      const response = await api.post('/airlines/', airlineData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في إنشاء شركة الطيران')
    }
  }
)

export const updateAirline = createAsyncThunk(
  'airlines/updateAirline',
  async ({ airlineId, airlineData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/airlines/${airlineId}/`, airlineData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في تحديث شركة الطيران')
    }
  }
)

export const deleteAirline = createAsyncThunk(
  'airlines/deleteAirline',
  async (airlineId, { rejectWithValue }) => {
    try {
      await api.delete(`/airlines/${airlineId}/`)
      return airlineId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في حذف شركة الطيران')
    }
  }
)

const initialState = {
  airlines: [],
  isLoading: false,
  error: null,
  lastUpdate: null
}

const airlinesSlice = createSlice({
  name: 'airlines',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setLastUpdate: (state, action) => {
      state.lastUpdate = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Airlines
      .addCase(fetchAirlines.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAirlines.fulfilled, (state, action) => {
        state.isLoading = false
        state.airlines = action.payload.results || action.payload
        state.lastUpdate = new Date().toISOString()
        state.error = null
      })
      .addCase(fetchAirlines.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create Airline
      .addCase(createAirline.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createAirline.fulfilled, (state, action) => {
        state.isLoading = false
        state.airlines.unshift(action.payload)
        state.error = null
      })
      .addCase(createAirline.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update Airline
      .addCase(updateAirline.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateAirline.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.airlines.findIndex(airline => airline.id === action.payload.id)
        if (index !== -1) {
          state.airlines[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateAirline.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete Airline
      .addCase(deleteAirline.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteAirline.fulfilled, (state, action) => {
        state.isLoading = false
        state.airlines = state.airlines.filter(airline => airline.id !== action.payload)
        state.error = null
      })
      .addCase(deleteAirline.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { clearError, setLastUpdate } = airlinesSlice.actions
export default airlinesSlice.reducer
