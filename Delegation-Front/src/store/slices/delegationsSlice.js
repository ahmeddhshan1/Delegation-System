import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { delegationService } from '../../services/api'

// Async thunks
export const fetchDelegations = createAsyncThunk(
  'delegations/fetchDelegations',
  async (subEventId, { rejectWithValue }) => {
    try {
      const response = await delegationService.getDelegations(subEventId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب الوفود')
    }
  }
)

export const createDelegation = createAsyncThunk(
  'delegations/createDelegation',
  async (delegationData, { rejectWithValue }) => {
    try {
      const response = await delegationService.createDelegation(delegationData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في إنشاء الوفد')
    }
  }
)

export const updateDelegation = createAsyncThunk(
  'delegations/updateDelegation',
  async ({ delegationId, delegationData }, { rejectWithValue }) => {
    try {
      const response = await delegationService.updateDelegation(delegationId, delegationData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في تحديث الوفد')
    }
  }
)

export const deleteDelegation = createAsyncThunk(
  'delegations/deleteDelegation',
  async (delegationId, { rejectWithValue }) => {
    try {
      await delegationService.deleteDelegation(delegationId)
      return delegationId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في حذف الوفد')
    }
  }
)

export const fetchDepartureSessions = createAsyncThunk(
  'delegations/fetchDepartureSessions',
  async (delegationId, { rejectWithValue }) => {
    try {
      const response = await delegationService.getDepartureSessions(delegationId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب جلسات المغادرة')
    }
  }
)

export const createDepartureSession = createAsyncThunk(
  'delegations/createDepartureSession',
  async (sessionData, { rejectWithValue }) => {
    try {
      const response = await delegationService.createDepartureSession(sessionData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في إنشاء جلسة المغادرة')
    }
  }
)

export const updateDepartureSession = createAsyncThunk(
  'delegations/updateDepartureSession',
  async ({ sessionId, sessionData }, { rejectWithValue }) => {
    try {
      const response = await delegationService.updateDepartureSession(sessionId, sessionData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في تحديث جلسة المغادرة')
    }
  }
)

export const deleteDepartureSession = createAsyncThunk(
  'delegations/deleteDepartureSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      await delegationService.deleteDepartureSession(sessionId)
      return sessionId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في حذف جلسة المغادرة')
    }
  }
)

const initialState = {
  delegations: [],
  departureSessions: [],
  currentDelegation: null,
  isLoading: false,
  error: null,
  selectedDelegation: null,
  stats: {
    totalDelegations: 0,
    militaryDelegations: 0,
    civilDelegations: 0,
    totalMembers: 0
  }
}

const delegationsSlice = createSlice({
  name: 'delegations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentDelegation: (state, action) => {
      state.currentDelegation = action.payload
      state.selectedDelegation = action.payload
    },
    clearCurrentDelegation: (state) => {
      state.currentDelegation = null
      state.selectedDelegation = null
    },
    updateDelegationLocal: (state, action) => {
      const index = state.delegations.findIndex(delegation => delegation.id === action.payload.id)
      if (index !== -1) {
        state.delegations[index] = { ...state.delegations[index], ...action.payload }
      }
    },
    removeDelegationLocal: (state, action) => {
      state.delegations = state.delegations.filter(delegation => delegation.id !== action.payload)
    },
    addDelegationLocal: (state, action) => {
      state.delegations.push(action.payload)
    },
    updateDepartureSessionLocal: (state, action) => {
      const index = state.departureSessions.findIndex(session => session.id === action.payload.id)
      if (index !== -1) {
        state.departureSessions[index] = { ...state.departureSessions[index], ...action.payload }
      }
    },
    removeDepartureSessionLocal: (state, action) => {
      state.departureSessions = state.departureSessions.filter(session => session.id !== action.payload)
    },
    addDepartureSessionLocal: (state, action) => {
      state.departureSessions.push(action.payload)
    },
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload }
    },
    clearDelegations: (state) => {
      state.delegations = []
      state.departureSessions = []
      state.currentDelegation = null
      state.selectedDelegation = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Delegations
      .addCase(fetchDelegations.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDelegations.fulfilled, (state, action) => {
        state.isLoading = false
        state.delegations = action.payload
        state.error = null
      })
      .addCase(fetchDelegations.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create Delegation
      .addCase(createDelegation.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createDelegation.fulfilled, (state, action) => {
        state.isLoading = false
        state.delegations.push(action.payload)
        state.error = null
      })
      .addCase(createDelegation.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update Delegation
      .addCase(updateDelegation.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateDelegation.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.delegations.findIndex(delegation => delegation.id === action.payload.id)
        if (index !== -1) {
          state.delegations[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateDelegation.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete Delegation
      .addCase(deleteDelegation.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteDelegation.fulfilled, (state, action) => {
        state.isLoading = false
        state.delegations = state.delegations.filter(delegation => delegation.id !== action.payload)
        state.error = null
      })
      .addCase(deleteDelegation.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch Departure Sessions
      .addCase(fetchDepartureSessions.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDepartureSessions.fulfilled, (state, action) => {
        state.isLoading = false
        state.departureSessions = action.payload
        state.error = null
      })
      .addCase(fetchDepartureSessions.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create Departure Session
      .addCase(createDepartureSession.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createDepartureSession.fulfilled, (state, action) => {
        state.isLoading = false
        state.departureSessions.push(action.payload)
        state.error = null
      })
      .addCase(createDepartureSession.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update Departure Session
      .addCase(updateDepartureSession.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateDepartureSession.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.departureSessions.findIndex(session => session.id === action.payload.id)
        if (index !== -1) {
          state.departureSessions[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateDepartureSession.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete Departure Session
      .addCase(deleteDepartureSession.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteDepartureSession.fulfilled, (state, action) => {
        state.isLoading = false
        state.departureSessions = state.departureSessions.filter(session => session.id !== action.payload)
        state.error = null
      })
      .addCase(deleteDepartureSession.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const {
  clearError,
  setCurrentDelegation,
  clearCurrentDelegation,
  updateDelegationLocal,
  removeDelegationLocal,
  addDelegationLocal,
  updateDepartureSessionLocal,
  removeDepartureSessionLocal,
  addDepartureSessionLocal,
  updateStats,
  clearDelegations
} = delegationsSlice.actions

export default delegationsSlice.reducer
