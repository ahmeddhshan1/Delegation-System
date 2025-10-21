// خدمة المصادقة - متصلة بالباك إند
import { toast } from "sonner"
import axios from 'axios'

// API للمصادقة
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// محاكاة بيانات المستخدمين
const mockUsers = [
    {
        id: 1,
        username: 'admin',
        password: 'admin123',
        full_name: 'مدير النظام',
        role: 'admin',
        is_active: true
    },
    {
        id: 2,
        username: 'superadmin',
        password: 'super123',
        full_name: 'مدير النظام الرئيسي',
        role: 'super_admin',
        is_active: true
    },
    {
        id: 3,
        username: 'user',
        password: 'user123',
        full_name: 'مستخدم عادي',
        role: 'user',
        is_active: true
    }
]

// خدمة المصادقة
export const authService = {
    // تسجيل الدخول
    async login(credentials) {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login/`, {
                username: credentials.username,
                password: credentials.password,
                device_info: {
                    user_agent: navigator.userAgent,
                    platform: navigator.platform,
                    language: navigator.language
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000
            })
            
            const { token, user } = response.data
            
            // تحديد التخزين حسب خيار تذكرني
            const storage = credentials.rememberMe ? window.localStorage : window.sessionStorage
            const otherStorage = credentials.rememberMe ? window.sessionStorage : window.localStorage
            
            // مسح أي أثر قديم في التخزين الآخر
            otherStorage.removeItem('authToken')
            otherStorage.removeItem('userRole')
            otherStorage.removeItem('userId')
            otherStorage.removeItem('userName')
            otherStorage.removeItem('isSuperAdmin')
            otherStorage.removeItem('isAdmin')
            
            // حفظ بيانات المستخدم في التخزين المختار
            storage.setItem('authToken', token)
            storage.setItem('userRole', user.role)
            storage.setItem('userId', String(user.id))
            storage.setItem('userName', user.full_name)
            storage.setItem('isSuperAdmin', String(user.is_super_admin))
            storage.setItem('isAdmin', String(user.is_admin))
            
            // إذا كان المستخدم Super Admin، أنشئ session للـ Django Admin
            if (user.is_super_admin) {
                try {
                    const adminSessionResponse = await axios.post(`${API_BASE_URL}/auth/create_admin_session/`, {}, {
                        headers: {
                            'Authorization': `Token ${token}`,
                            'Content-Type': 'application/json',
                        }
                    })
                    
                    // حفظ معلومات الـ admin session
                    localStorage.setItem('adminSessionKey', adminSessionResponse.data.session_key)
                    localStorage.setItem('adminCSRFToken', adminSessionResponse.data.csrf_token)
                    localStorage.setItem('adminUrl', adminSessionResponse.data.admin_url)
                    localStorage.setItem('adminToken', adminSessionResponse.data.admin_token)
                } catch (adminError) {
                    console.warn('Failed to create admin session:', adminError)
                    // لا نوقف عملية تسجيل الدخول إذا فشل إنشاء admin session
                }
            }
            
            return {
                success: true,
                token,
                user
            }
        } catch (error) {
            console.error('Login error details:', error)
            let message = 'حدث خطأ في تسجيل الدخول'
            
            if (error.code === 'ECONNABORTED') {
                message = 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى'
            } else if (error.code === 'ERR_NETWORK') {
                message = 'خطأ في الشبكة. تأكد من أن الخادم يعمل'
            } else if (error.response?.status === 401) {
                message = 'اسم المستخدم أو كلمة المرور غير صحيحة'
            } else if (error.response?.status === 400) {
                message = 'بيانات غير صحيحة'
            } else if (error.response?.data?.error) {
                message = error.response.data.error
            } else if (error.response?.data?.detail) {
                message = error.response.data.detail
            } else if (error.response?.data?.non_field_errors) {
                message = error.response.data.non_field_errors[0]
            } else if (error.message) {
                message = error.message
            }
            
            throw new Error(message)
        }
    },
    
    // تسجيل الخروج
    async logout() {
        try {
            const token = localStorage.getItem('authToken')
            if (token) {
                await axios.post(`${API_BASE_URL}/auth/logout/`, {}, {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                })
            }
            
            // حذف بيانات المستخدم من localStorage
            localStorage.removeItem('authToken')
            localStorage.removeItem('userRole')
            localStorage.removeItem('userId')
            localStorage.removeItem('userName')
            localStorage.removeItem('isSuperAdmin')
            localStorage.removeItem('isAdmin')
            
            // حذف بيانات Django Admin
            localStorage.removeItem('adminSessionKey')
            localStorage.removeItem('adminCSRFToken')
            localStorage.removeItem('adminUrl')
            localStorage.removeItem('adminToken')
            
            return { success: true }
        } catch (error) {
            // حتى لو فشل الطلب، نمسح البيانات المحلية
            localStorage.removeItem('authToken')
            localStorage.removeItem('userRole')
            localStorage.removeItem('userId')
            localStorage.removeItem('userName')
            localStorage.removeItem('isSuperAdmin')
            localStorage.removeItem('isAdmin')
            
            // حذف بيانات Django Admin
            localStorage.removeItem('adminSessionKey')
            localStorage.removeItem('adminCSRFToken')
            localStorage.removeItem('adminUrl')
            localStorage.removeItem('adminToken')
            
            return { success: true }
        }
    },
    
    // التحقق من صحة الرمز
    async verifyToken(token) {
        try {
            if (!token) {
                throw new Error('رمز الوصول غير موجود')
            }
            
            // التحقق من الرمز عبر API
            const response = await axios.get(`${API_BASE_URL}/auth/me/`, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            })
            
            return { success: true, valid: true, user: response.data }
        } catch (error) {
            return { success: false, valid: false, error: error.message }
        }
    },
    
    // الحصول على معلومات المستخدم الحالي
    getCurrentUser() {
        try {
            const token = localStorage.getItem('authToken')
            const role = localStorage.getItem('userRole') || 'ADMIN'
            const userId = localStorage.getItem('userId')
            const userName = localStorage.getItem('userName')
            
            if (!token || !userId || !userName) {
                return null
            }
            
            return {
                id: parseInt(userId),
                username: 'current_user', // يمكن جلبها من localStorage إذا لزم الأمر
                full_name: userName,
                role: role
            }
        } catch (error) {
            console.error('خطأ في جلب معلومات المستخدم:', error)
            return null
        }
    },
    
    // التحقق من حالة تسجيل الدخول
    isAuthenticated() {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
        const role = localStorage.getItem('userRole') || sessionStorage.getItem('userRole')
        
        return !!(token && role)
    },
    
    // الحصول على رمز الوصول
    getToken() {
        return localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
    },
    
    // الحصول على دور المستخدم
    getUserRole() {
        return localStorage.getItem('userRole') || sessionStorage.getItem('userRole')
    },
    
    // تحديث كلمة المرور
    async changePassword(currentPassword, newPassword) {
        try {
            const token = localStorage.getItem('authToken')
            if (!token) {
                throw new Error('المستخدم غير مسجل الدخول')
            }
            
            // إرسال طلب تحديث كلمة المرور للـ API
            const response = await axios.post(`${API_BASE_URL}/auth/change-password/`, {
                current_password: currentPassword,
                new_password: newPassword
            }, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            })
            
            return { success: true, message: 'تم تحديث كلمة المرور بنجاح' }
        } catch (error) {
            const message = error.response?.data?.error || 'حدث خطأ في تحديث كلمة المرور'
            throw new Error(message)
        }
    },
    
    // إعادة تعيين كلمة المرور
    async resetPassword(username) {
        try {
            // إرسال طلب إعادة تعيين كلمة المرور للـ API
            const response = await axios.post(`${API_BASE_URL}/auth/reset-password/`, {
                username: username
            })
            
            return { 
                success: true, 
                message: response.data.message || 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني'
            }
        } catch (error) {
            const message = error.response?.data?.error || 'حدث خطأ في إعادة تعيين كلمة المرور'
            throw new Error(message)
        }
    },
    
    // فتح Django Admin Dashboard
    openAdminDashboard() {
        try {
            const adminUrl = localStorage.getItem('adminUrl')
            const adminToken = localStorage.getItem('adminToken')
            
            if (!adminToken) {
                throw new Error('Admin session not found. Please login again.')
            }
            
            // استخدام الـ admin URL الذي يحتوي على الـ token
            const adminBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                ? 'http://localhost:8000' 
                : `http://${window.location.hostname}:8000`
            const adminFullUrl = `${adminBaseUrl}${adminUrl}`
            
            // فتح في تبويب جديد مباشرة
            window.open(adminFullUrl, '_blank')
            
            return { success: true, url: adminFullUrl }
        } catch (error) {
            console.error('Error opening admin dashboard:', error)
            throw new Error(error.message)
        }
    },
    
    // التحقق من وجود admin session
    hasAdminSession() {
        const adminToken = localStorage.getItem('adminToken')
        const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true'
        return !!(adminToken && isSuperAdmin)
    }
}

// تصدير افتراضي
export default authService
