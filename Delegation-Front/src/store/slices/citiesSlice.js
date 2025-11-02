import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../plugins/axios'

// Async thunks for cities
export const fetchCities = createAsyncThunk(
  'cities/fetchCities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/cities/')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب المدن')
    }
  }
)

export const createCity = createAsyncThunk(
  'cities/createCity',
  async (cityData, { rejectWithValue }) => {
    try {
      const response = await api.post('/cities/', cityData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في إنشاء المدينة')
    }
  }
)

export const updateCity = createAsyncThunk(
  'cities/updateCity',
  async ({ cityId, cityData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/cities/${cityId}/`, cityData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في تحديث المدينة')
    }
  }
)

export const deleteCity = createAsyncThunk(
  'cities/deleteCity',
  async (cityId, { rejectWithValue }) => {
    try {
      await api.delete(`/cities/${cityId}/`)
      return cityId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في حذف المدينة')
    }
  }
)

const initialState = {
  cities: [],
  isLoading: false,
  error: null,
  lastUpdate: null
}

const citiesSlice = createSlice({
  name: 'cities',
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
      // Fetch Cities
      .addCase(fetchCities.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.isLoading = false
        state.cities = action.payload.results || action.payload
        state.lastUpdate = new Date().toISOString()
        state.error = null
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create City
      .addCase(createCity.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createCity.fulfilled, (state, action) => {
        state.isLoading = false
        state.cities.unshift(action.payload)
        state.error = null
      })
      .addCase(createCity.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update City
      .addCase(updateCity.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateCity.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.cities.findIndex(city => city.id === action.payload.id)
        if (index !== -1) {
          state.cities[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateCity.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete City
      .addCase(deleteCity.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteCity.fulfilled, (state, action) => {
        state.isLoading = false
        state.cities = state.cities.filter(city => city.id !== action.payload)
        state.error = null
      })
      .addCase(deleteCity.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { clearError, setLastUpdate } = citiesSlice.actions
export default citiesSlice.reducer
