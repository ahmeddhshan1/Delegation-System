import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../plugins/axios'

// Async thunks
export const fetchMembers = createAsyncThunk(
  'members/fetchMembers',
  async (delegationId, { rejectWithValue }) => {
    try {
      const params = delegationId ? { delegation_id: delegationId } : {}
      const response = await api.get('/members/', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب الأعضاء')
    }
  }
)

export const fetchAllMembers = createAsyncThunk(
  'members/fetchAllMembers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/members/')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب جميع الأعضاء')
    }
  }
)

export const fetchAllDepartureSessions = createAsyncThunk(
  'members/fetchAllDepartureSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/check-outs/')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب جلسات المغادرة')
    }
  }
)

export const createMember = createAsyncThunk(
  'members/createMember',
  async (memberData, { rejectWithValue }) => {
    try {
      const response = await api.post('/members/', memberData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في إنشاء العضو')
    }
  }
)

export const updateMember = createAsyncThunk(
  'members/updateMember',
  async ({ memberId, memberData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/members/${memberId}/`, memberData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في تحديث العضو')
    }
  }
)

export const deleteMember = createAsyncThunk(
  'members/deleteMember',
  async (memberId, { rejectWithValue }) => {
    try {
      await api.delete(`/members/${memberId}/`)
      return memberId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في حذف العضو')
    }
  }
)

export const fetchNationalities = createAsyncThunk(
  'members/fetchNationalities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/nationalities/')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب الجنسيات')
    }
  }
)

export const fetchMilitaryPositions = createAsyncThunk(
  'members/fetchMilitaryPositions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/military-positions/')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب الرتب العسكرية')
    }
  }
)

const initialState = {
  members: [],
  allMembers: [],
  departureSessions: [],
  nationalities: [],
  militaryPositions: [],
  currentMember: null,
  isLoading: false,
  error: null,
  selectedMember: null,
  stats: {
    totalMembers: 0,
    departedMembers: 0,
    remainingMembers: 0
  }
}

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentMember: (state, action) => {
      state.currentMember = action.payload
      state.selectedMember = action.payload
    },
    clearCurrentMember: (state) => {
      state.currentMember = null
      state.selectedMember = null
    },
    updateMemberLocal: (state, action) => {
      const index = state.members.findIndex(member => member.id === action.payload.id)
      if (index !== -1) {
        state.members[index] = { ...state.members[index], ...action.payload }
      }
      
      // Update in allMembers array as well
      const allIndex = state.allMembers.findIndex(member => member.id === action.payload.id)
      if (allIndex !== -1) {
        state.allMembers[allIndex] = { ...state.allMembers[allIndex], ...action.payload }
      }
    },
    removeMemberLocal: (state, action) => {
      state.members = state.members.filter(member => member.id !== action.payload)
      state.allMembers = state.allMembers.filter(member => member.id !== action.payload)
    },
    addMemberLocal: (state, action) => {
      state.members.push(action.payload)
      state.allMembers.push(action.payload)
    },
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload }
    },
    clearMembers: (state) => {
      state.members = []
      state.currentMember = null
      state.selectedMember = null
    },
    filterMembersByDelegation: (state, action) => {
      const delegationId = action.payload
      state.members = state.allMembers.filter(member => member.delegation?.id === delegationId)
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Members
      .addCase(fetchMembers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.isLoading = false
        // Handle both array and paginated response formats
        state.members = Array.isArray(action.payload) 
          ? action.payload 
          : (action.payload?.results || [])
        state.error = null
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch All Members
      .addCase(fetchAllMembers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllMembers.fulfilled, (state, action) => {
        state.isLoading = false
        state.members = action.payload.results || action.payload
        state.allMembers = action.payload.results || action.payload
        state.error = null
      })
      .addCase(fetchAllMembers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch All Departure Sessions
      .addCase(fetchAllDepartureSessions.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllDepartureSessions.fulfilled, (state, action) => {
        state.isLoading = false
        state.departureSessions = action.payload.results || action.payload
        state.error = null
      })
      .addCase(fetchAllDepartureSessions.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create Member
      .addCase(createMember.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createMember.fulfilled, (state, action) => {
        state.isLoading = false
        state.members.push(action.payload)
        state.allMembers.push(action.payload)
        state.error = null
      })
      .addCase(createMember.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update Member
      .addCase(updateMember.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateMember.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.members.findIndex(member => member.id === action.payload.id)
        if (index !== -1) {
          state.members[index] = action.payload
        }
        
        const allIndex = state.allMembers.findIndex(member => member.id === action.payload.id)
        if (allIndex !== -1) {
          state.allMembers[allIndex] = action.payload
        }
        state.error = null
      })
      .addCase(updateMember.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete Member
      .addCase(deleteMember.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteMember.fulfilled, (state, action) => {
        state.isLoading = false
        state.members = state.members.filter(member => member.id !== action.payload)
        state.allMembers = state.allMembers.filter(member => member.id !== action.payload)
        state.error = null
      })
      .addCase(deleteMember.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch Nationalities
      .addCase(fetchNationalities.fulfilled, (state, action) => {
        state.nationalities = action.payload
      })
      
      // Fetch Military Positions
      .addCase(fetchMilitaryPositions.fulfilled, (state, action) => {
        state.militaryPositions = action.payload
      })
  }
})

export const {
  clearError,
  setCurrentMember,
  clearCurrentMember,
  updateMemberLocal,
  removeMemberLocal,
  addMemberLocal,
  updateStats,
  clearMembers,
  filterMembersByDelegation
} = membersSlice.actions

export default membersSlice.reducer
