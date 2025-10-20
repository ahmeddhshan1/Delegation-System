import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { authService } from '../../services/auth'
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
                    // التحقق من صحة الرمز
                    const verification = await authService.verifyToken(token)
                    
                    if (verification.valid) {
                        const currentUser = verification.user || authService.getCurrentUser()
                        dispatch(setUser(currentUser))
                        dispatch(setUserRole(currentUser.role))
                        dispatch(setPermissionsRole(currentUser.role))
                        dispatch(setToken(token))
                    } else {
                        // الرمز غير صالح، مسح البيانات
                        await authService.logout()
                        dispatch(clearAuth())
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
            if (response.success) {
                dispatch(setUser(response.user))
                dispatch(setUserRole(response.user.role))
                dispatch(setPermissionsRole(response.user.role))
                dispatch(setToken(response.token))
                return response
            }
            throw new Error(response.message || 'فشل في تسجيل الدخول')
        } catch (error) {
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
