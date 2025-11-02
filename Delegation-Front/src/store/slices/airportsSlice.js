import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../plugins/axios'

// Async thunks for airports
export const fetchAirports = createAsyncThunk(
  'airports/fetchAirports',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/airports/')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب المطارات')
    }
  }
)

export const createAirport = createAsyncThunk(
  'airports/createAirport',
  async (airportData, { rejectWithValue }) => {
    try {
      const response = await api.post('/airports/', airportData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في إنشاء المطار')
    }
  }
)

export const updateAirport = createAsyncThunk(
  'airports/updateAirport',
  async ({ airportId, airportData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/airports/${airportId}/`, airportData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في تحديث المطار')
    }
  }
)

export const deleteAirport = createAsyncThunk(
  'airports/deleteAirport',
  async (airportId, { rejectWithValue }) => {
    try {
      await api.delete(`/airports/${airportId}/`)
      return airportId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في حذف المطار')
    }
  }
)

const initialState = {
  airports: [],
  isLoading: false,
  error: null,
  lastUpdate: null
}

const airportsSlice = createSlice({
  name: 'airports',
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
      // Fetch Airports
      .addCase(fetchAirports.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAirports.fulfilled, (state, action) => {
        state.isLoading = false
        state.airports = action.payload.results || action.payload
        state.lastUpdate = new Date().toISOString()
        state.error = null
      })
      .addCase(fetchAirports.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create Airport
      .addCase(createAirport.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createAirport.fulfilled, (state, action) => {
        state.isLoading = false
        state.airports.unshift(action.payload)
        state.error = null
      })
      .addCase(createAirport.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update Airport
      .addCase(updateAirport.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateAirport.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.airports.findIndex(airport => airport.id === action.payload.id)
        if (index !== -1) {
          state.airports[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateAirport.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete Airport
      .addCase(deleteAirport.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteAirport.fulfilled, (state, action) => {
        state.isLoading = false
        state.airports = state.airports.filter(airport => airport.id !== action.payload)
        state.error = null
      })
      .addCase(deleteAirport.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { clearError, setLastUpdate } = airportsSlice.actions
export default airportsSlice.reducer
