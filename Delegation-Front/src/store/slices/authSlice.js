import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../../plugins/auth'
import { PURGE } from 'redux-persist'

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login({ username, password })
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'خطأ في تسجيل الدخول')
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await authService.logout()
      // مسح جميع البيانات المحفوظة
      dispatch({ type: PURGE, key: 'root', result: () => null })
      return null
    } catch (error) {
      return rejectWithValue(error.message || 'خطأ في تسجيل الخروج')
    }
  }
)

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.verifyToken()
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'خطأ في التحقق من الرمز')
    }
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser()
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'خطأ في جلب بيانات المستخدم')
    }
  }
)

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'خطأ في تغيير كلمة المرور')
    }
  }
)

export const openAdminDashboard = createAsyncThunk(
  'auth/openAdminDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.openAdminDashboard()
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'خطأ في فتح لوحة الإدارة')
    }
  }
)

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  userRole: null,
  permissions: [],
  adminSession: {
    hasSession: false,
    adminUrl: null,
    adminToken: null,
    adminSessionKey: null,
    adminCSRFToken: null
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
    setToken: (state, action) => {
      state.token = action.payload
    },
    setUserRole: (state, action) => {
      state.userRole = action.payload
    },
    setPermissions: (state, action) => {
      state.permissions = action.payload
    },
    clearAuth: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.userRole = null
      state.permissions = []
      state.adminSession = {
        hasSession: false,
        adminUrl: null,
        adminToken: null,
        adminSessionKey: null,
        adminCSRFToken: null
      }
    },
    updateAdminSession: (state, action) => {
      state.adminSession = { ...state.adminSession, ...action.payload }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.userRole = action.payload.user.role
        state.permissions = action.payload.permissions || []
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.userRole = null
        state.permissions = []
        state.adminSession = {
          hasSession: false,
          adminUrl: null,
          adminToken: null,
          adminSessionKey: null,
          adminCSRFToken: null
        }
        state.error = null
      })
      
      // Verify Token
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isAuthenticated = true
        state.user = action.payload.user
        state.userRole = action.payload.user.role
        state.permissions = action.payload.permissions || []
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.userRole = null
        state.permissions = []
      })
      
      // Get Current User
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.userRole = action.payload.role
      })
      
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Open Admin Dashboard
      .addCase(openAdminDashboard.fulfilled, (state, action) => {
        state.adminSession = { ...state.adminSession, ...action.payload, hasSession: true }
      })
  }
})

export const {
  clearError,
  setUser,
  setToken,
  setUserRole,
  setPermissions,
  clearAuth,
  updateAdminSession
} = authSlice.actions

export default authSlice.reducer
