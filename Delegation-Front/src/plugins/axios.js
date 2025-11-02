import axios from 'axios'

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
        if (token) {
            config.headers.Authorization = `Token ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear auth data on 401
            localStorage.removeItem('authToken')
            localStorage.removeItem('userRole')
            localStorage.removeItem('userId')
            localStorage.removeItem('userName')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api
