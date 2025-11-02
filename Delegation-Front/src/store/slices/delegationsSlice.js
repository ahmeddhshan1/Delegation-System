import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../plugins/axios'

// Request deduplication cache
const requestCache = new Map()
const CACHE_DURATION = 5000 // 5 seconds cache

// ===== Local fallback storage for departure sessions =====
const LS_DEPARTURE_SESSIONS_KEY = 'ds_departure_sessions'

const readAllLocalDeparture = () => {
  try {
    const raw = localStorage.getItem(LS_DEPARTURE_SESSIONS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const writeAllLocalDeparture = (obj) => {
  try {
    localStorage.setItem(LS_DEPARTURE_SESSIONS_KEY, JSON.stringify(obj))
  } catch {
    // ignore
  }
}

const getLocalSessions = (delegationId) => {
  const all = readAllLocalDeparture()
  return all[delegationId] || []
}

const setLocalSessions = (delegationId, sessions) => {
  const all = readAllLocalDeparture()
  all[delegationId] = sessions
  writeAllLocalDeparture(all)
}

const genLocalId = () => {
  // simple unique id: timestamp + random
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// Helper function to create cache key
const createCacheKey = (subEventId) => `delegations_${subEventId || 'all'}`

// Helper function to check if request is cached and valid
const isRequestCached = (cacheKey) => {
  const cached = requestCache.get(cacheKey)
  if (!cached) return false
  
  const now = Date.now()
  return (now - cached.timestamp) < CACHE_DURATION
}

// Async thunks with deduplication
export const fetchDelegations = createAsyncThunk(
  'delegations/fetchDelegations',
  async (subEventId, { rejectWithValue, getState }) => {
    const cacheKey = createCacheKey(subEventId)
    
    // Check if request is already in progress
    if (requestCache.has(cacheKey) && requestCache.get(cacheKey).promise) {
      return await requestCache.get(cacheKey).promise
    }
    
    // Check if we have valid cached data
    if (isRequestCached(cacheKey)) {
      return requestCache.get(cacheKey).data
    }
    
    // Create new request
    const requestPromise = (async () => {
      try {
        const params = subEventId ? { sub_event: subEventId } : {}
        const response = await api.get('/delegations/', { params })
        
        // Cache the successful response
        requestCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now(),
          promise: null
        })
        
        return response.data
      } catch (error) {
        // Remove failed request from cache
        requestCache.delete(cacheKey)
        throw error
      }
    })()
    
    // Store the promise to prevent duplicate requests
    requestCache.set(cacheKey, {
      data: null,
      timestamp: 0,
      promise: requestPromise
    })
    
    try {
      return await requestPromise
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب الوفود')
    }
  }
)

export const createDelegation = createAsyncThunk(
  'delegations/createDelegation',
  async (delegationData, { rejectWithValue }) => {
    try {
      const response = await api.post('/delegations/', delegationData)
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
      const response = await api.patch(`/delegations/${delegationId}/`, delegationData)
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
      await api.delete(`/delegations/${delegationId}/`)
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
      const params = delegationId ? { delegation_id: delegationId } : {}
      const response = await api.get('/check-outs/', { params })
      
      // تأكد إن الـ response array
      const data = response.data
      if (Array.isArray(data)) {
        return data
      } else if (data && Array.isArray(data.results)) {
        return data.results
      } else if (data && typeof data === 'object') {
        return []
      }
      return []
    } catch (error) {
      // 404 -> use local fallback
      if (error.response?.status === 404) {
        const local = delegationId ? getLocalSessions(delegationId) : []
        return local
      }
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب جلسات المغادرة')
    }
  }
)

export const createDepartureSession = createAsyncThunk(
  'delegations/createDepartureSession',
  async (sessionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/check-outs/', sessionData)
      return response.data
    } catch (error) {
      // 404 -> create locally and return as success
      if (error.response?.status === 404) {
        const delegationId = sessionData?.delegation || sessionData?.delegation_id
        const current = delegationId ? getLocalSessions(delegationId) : []
        const newSession = {
          id: genLocalId(),
          delegation: delegationId,
          ...sessionData,
        }
        const updated = [ ...current, newSession ]
        if (delegationId) setLocalSessions(delegationId, updated)
        return newSession
      }
      return rejectWithValue(error.response?.data?.message || 'خطأ في إنشاء جلسة المغادرة')
    }
  }
)

export const updateDepartureSession = createAsyncThunk(
  'delegations/updateDepartureSession',
  async ({ sessionId, sessionData }, { rejectWithValue }) => {
    try {
      // Check if it's a local session ID
      if (sessionId.startsWith('local-')) {
        const delegationId = sessionData?.delegation || sessionData?.delegation_id
        if (!delegationId) return rejectWithValue('تعذر تحديث الجلسة بدون معرف الوفد')
        
        const current = getLocalSessions(delegationId)
        const idx = current.findIndex(s => s.id === sessionId)
        if (idx === -1) return rejectWithValue('الجلسة غير موجودة محلياً')
        
        const updatedSession = { ...current[idx], ...sessionData, id: sessionId }
        const next = [ ...current ]
        next[idx] = updatedSession
        setLocalSessions(delegationId, next)
        return updatedSession
      }
      
      // Try to update in database
      const response = await api.patch(`/check-outs/${sessionId}/`, sessionData)
      return response.data
    } catch (error) {
      // 404 -> update locally and return as success
      if (error.response?.status === 404) {
        const delegationId = sessionData?.delegation || sessionData?.delegation_id
        if (!delegationId) return rejectWithValue('تعذر تحديث الجلسة بدون معرف الوفد')
        const current = getLocalSessions(delegationId)
        const idx = current.findIndex(s => s.id === sessionId)
        if (idx === -1) return rejectWithValue('الجلسة غير موجودة محلياً')
        const updatedSession = { ...current[idx], ...sessionData, id: sessionId }
        const next = [ ...current ]
        next[idx] = updatedSession
        setLocalSessions(delegationId, next)
        return updatedSession
      }
      return rejectWithValue(error.response?.data?.message || 'خطأ في تحديث جلسة المغادرة')
    }
  }
)

export const deleteDepartureSession = createAsyncThunk(
  'delegations/deleteDepartureSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      // Check if it's a local session ID
      if (sessionId.startsWith('local-')) {
        // Need to search all delegations to remove the session
        const all = readAllLocalDeparture()
        for (const [delegationId, sessions] of Object.entries(all)) {
          const exists = sessions.some(s => s.id === sessionId)
          if (exists) {
            all[delegationId] = sessions.filter(s => s.id !== sessionId)
            writeAllLocalDeparture(all)
            return sessionId
          }
        }
        return rejectWithValue('الجلسة غير موجودة محلياً')
      }
      
      // Try to delete from database
      await api.delete(`/check-outs/${sessionId}/`)
      return sessionId
    } catch (error) {
      // 404 -> delete locally and return as success
      if (error.response?.status === 404) {
        // Need to search all delegations to remove the session
        const all = readAllLocalDeparture()
        for (const [delegationId, sessions] of Object.entries(all)) {
          const exists = sessions.some(s => s.id === sessionId)
          if (exists) {
            all[delegationId] = sessions.filter(s => s.id !== sessionId)
            writeAllLocalDeparture(all)
            return sessionId
          }
        }
        return rejectWithValue('الجلسة غير موجودة للحذف')
      }
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
    },
    clearDelegationsCache: () => {
      // Clear all cached delegation requests
      requestCache.clear()
      console.log('🗑️ Delegations cache cleared')
    },
    invalidateDelegationsCache: (state, action) => {
      // Invalidate specific cache entries
      const subEventId = action.payload
      if (subEventId) {
        requestCache.delete(createCacheKey(subEventId))
        console.log(`🗑️ Cache invalidated for subEvent: ${subEventId}`)
      } else {
        // Clear all delegation caches
        for (const key of requestCache.keys()) {
          if (key.startsWith('delegations_')) {
            requestCache.delete(key)
          }
        }
        console.log('🗑️ All delegations cache invalidated')
      }
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
        // Handle both array and paginated response formats
        state.delegations = Array.isArray(action.payload) 
          ? action.payload 
          : (action.payload?.results || [])
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
        // Invalidate cache when new delegation is created
        requestCache.clear()
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
        // Invalidate cache when delegation is updated
        requestCache.clear()
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
        // Invalidate cache when delegation is deleted
        requestCache.clear()
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
        // تأكد إن الـ payload array
        state.departureSessions = Array.isArray(action.payload) ? action.payload : []
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
  clearDelegations,
  clearDelegationsCache,
  invalidateDelegationsCache
} = delegationsSlice.actions

export default delegationsSlice.reducer
