import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { authService } from '../../plugins/auth'
import Loading from '../Loading'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setUser, setUserRole, setToken, clearAuth } from '../../store/slices/authSlice'
import { setUserRole as setPermissionsRole, clearPermissions } from '../../store/slices/permissionsSlice'

const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useAppDispatch()
    const { user, isAuthenticated, userRole } = useAppSelector((state) => state.auth)

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = authService.getToken()
                
                if (token) {
                    // Try to get current user instead of verifying token
                    try {
                        const currentUser = await authService.getCurrentUser()
                        dispatch(setUser(currentUser))
                        dispatch(setUserRole(currentUser.role || currentUser.user_role))
                        dispatch(setPermissionsRole(currentUser.role || currentUser.user_role))
                        dispatch(setToken(token))
                    } catch (error) {
                        // If getting user fails, token is invalid
                        console.log('Token invalid, clearing auth')
                        dispatch(clearAuth())
                        localStorage.removeItem('authToken')
                        sessionStorage.removeItem('authToken')
                    }
                } else {
                    dispatch(clearAuth())
                }
            } catch (error) {
                console.error('Auth initialization error:', error)
                dispatch(clearAuth())
            } finally {
                setLoading(false)
            }
        }

        initAuth()
    }, [])

    const login = async (credentials) => {
        try {
            const response = await authService.login(credentials)
            
            // Check if response has data (successful login)
            if (response && (response.success || response.token || response.user)) {
                const userData = response.user || response
                const token = response.token || response.key
                
                dispatch(setUser(userData))
                dispatch(setUserRole(userData.role || userData.user_role))
                dispatch(setPermissionsRole(userData.role || userData.user_role))
                dispatch(setToken(token))
                
                // Store token based on rememberMe
                if (credentials.rememberMe) {
                    localStorage.setItem('authToken', token)
                } else {
                    sessionStorage.setItem('authToken', token)
                }
                
                return { success: true, user: userData, token }
            }
            
            throw new Error(response.message || 'فشل في تسجيل الدخول')
        } catch (error) {
            // Handle axios error response
            if (error.response) {
                const errorMessage = error.response.data?.message 
                    || error.response.data?.error 
                    || error.response.data?.detail
                    || 'اسم المستخدم أو كلمة المرور غير صحيحة'
                throw new Error(errorMessage)
            }
            throw error
        }
    }

    const logout = async () => {
        try {
            await authService.logout()
            dispatch(clearAuth())
            dispatch(clearPermissions())
        } catch (error) {
            console.error('Logout error:', error)
            dispatch(clearAuth())
            dispatch(clearPermissions())
        }
    }

    const value = {
        user,
        login,
        logout,
        isAuthenticated,
        loading,
        userRole
    }

    // عرض شاشة التحميل أثناء التحقق من المصادقة
    if (loading) {
        return <Loading message="جاري التحقق من المصادقة..." />
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider
