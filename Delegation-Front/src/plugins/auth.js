import api from './axios'

// Auth service functions
export const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login/', {
        username: credentials.username,
        password: credentials.password
      })
      return response.data
    } catch (error) {
      // Re-throw the error to be handled by AuthProvider
      throw error
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await api.post('/auth/logout/')
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me/')
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get user permissions
  getUserPermissions: async () => {
    try {
      const response = await api.get('/auth/user_permissions/')
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Check specific permission
  checkPermission: async (permission) => {
    try {
      const response = await api.get(`/auth/check_permission/?permission=${permission}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh/')
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get token from storage
  getToken: () => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
  },

  // Check if user has admin session
  hasAdminSession: () => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
    const userRole = localStorage.getItem('userRole')
    return !!(token && userRole && userRole === 'SUPER_ADMIN')
  },

  // Verify token
  verifyToken: async (token) => {
    try {
      const response = await api.post('/auth/verify/', { token })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password/', {
        current_password: currentPassword,
        new_password: newPassword
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Open admin dashboard
  openAdminDashboard: async () => {
    try {
      const response = await api.get('/auth/admin-dashboard/')
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default authService
