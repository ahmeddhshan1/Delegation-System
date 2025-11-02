import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../plugins/axios'

// Async thunks for equivalent jobs
export const fetchEquivalentJobs = createAsyncThunk(
  'equivalentJobs/fetchEquivalentJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/equivalent-jobs/')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب الوظائف المعادلة')
    }
  }
)

export const createEquivalentJob = createAsyncThunk(
  'equivalentJobs/createEquivalentJob',
  async (jobData, { rejectWithValue }) => {
    try {
      const response = await api.post('/equivalent-jobs/', jobData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في إنشاء الوظيفة المعادلة')
    }
  }
)

export const deleteEquivalentJob = createAsyncThunk(
  'equivalentJobs/deleteEquivalentJob',
  async (jobId, { rejectWithValue }) => {
    try {
      await api.delete(`/equivalent-jobs/${jobId}/`)
      return jobId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في حذف الوظيفة المعادلة')
    }
  }
)

const initialState = {
  jobs: [],
  isLoading: false,
  error: null,
  lastUpdate: null
}

const equivalentJobsSlice = createSlice({
  name: 'equivalentJobs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Jobs
      .addCase(fetchEquivalentJobs.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchEquivalentJobs.fulfilled, (state, action) => {
        state.isLoading = false
        state.jobs = action.payload.results || action.payload
        state.lastUpdate = new Date().toISOString()
        state.error = null
      })
      .addCase(fetchEquivalentJobs.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create Job
      .addCase(createEquivalentJob.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createEquivalentJob.fulfilled, (state, action) => {
        state.isLoading = false
        state.jobs.unshift(action.payload)
        state.error = null
      })
      .addCase(createEquivalentJob.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete Job
      .addCase(deleteEquivalentJob.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteEquivalentJob.fulfilled, (state, action) => {
        state.isLoading = false
        state.jobs = state.jobs.filter(job => job.id !== action.payload)
        state.error = null
      })
      .addCase(deleteEquivalentJob.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { clearError } = equivalentJobsSlice.actions
export default equivalentJobsSlice.reducer
