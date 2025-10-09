// خدمة المصادقة - محاكاة للباك إند
import { toast } from "sonner"

// محاكاة API للمصادقة
const API_BASE_URL = 'http://localhost:8000/api' // سيتم تغييرها عند ربط الباك إند

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
            // محاكاة تأخير الشبكة
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            const { username, password } = credentials
            
            // البحث عن المستخدم
            const user = mockUsers.find(u => 
                u.username === username && u.password === password && u.is_active
            )
            
            if (!user) {
                throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة')
            }
            
            // إنشاء رمز الوصول (محاكاة)
            const token = `mock_token_${user.id}_${Date.now()}`
            
            // حفظ بيانات المستخدم في localStorage
            localStorage.setItem('authToken', token)
            localStorage.setItem('userRole', user.role)
            localStorage.setItem('userId', user.id.toString())
            localStorage.setItem('userName', user.full_name)
            
            return {
                success: true,
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    full_name: user.full_name,
                    role: user.role
                }
            }
        } catch (error) {
            throw new Error(error.message || 'حدث خطأ في تسجيل الدخول')
        }
    },
    
    // تسجيل الخروج
    async logout() {
        try {
            // محاكاة تأخير الشبكة
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // حذف بيانات المستخدم من localStorage
            localStorage.removeItem('authToken')
            localStorage.removeItem('userRole')
            localStorage.removeItem('userId')
            localStorage.removeItem('userName')
            
            return { success: true }
        } catch (error) {
            throw new Error('حدث خطأ في تسجيل الخروج')
        }
    },
    
    // التحقق من صحة الرمز
    async verifyToken(token) {
        try {
            // محاكاة تأخير الشبكة
            await new Promise(resolve => setTimeout(resolve, 300))
            
            if (!token) {
                throw new Error('رمز الوصول غير موجود')
            }
            
            // محاكاة التحقق من الرمز
            const isValid = token.startsWith('mock_token_')
            
            if (!isValid) {
                throw new Error('رمز الوصول غير صالح')
            }
            
            return { success: true, valid: true }
        } catch (error) {
            return { success: false, valid: false, error: error.message }
        }
    },
    
    // الحصول على معلومات المستخدم الحالي
    getCurrentUser() {
        try {
            const token = localStorage.getItem('authToken')
            const role = localStorage.getItem('userRole') || 'admin'
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
        const token = localStorage.getItem('authToken')
        const role = localStorage.getItem('userRole')
        
        return !!(token && role)
    },
    
    // الحصول على رمز الوصول
    getToken() {
        return localStorage.getItem('authToken')
    },
    
    // الحصول على دور المستخدم
    getUserRole() {
        return localStorage.getItem('userRole')
    },
    
    // تحديث كلمة المرور
    async changePassword(currentPassword, newPassword) {
        try {
            // محاكاة تأخير الشبكة
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            const currentUser = this.getCurrentUser()
            if (!currentUser) {
                throw new Error('المستخدم غير مسجل الدخول')
            }
            
            // محاكاة التحقق من كلمة المرور الحالية
            const user = mockUsers.find(u => u.id === currentUser.id)
            if (!user || user.password !== currentPassword) {
                throw new Error('كلمة المرور الحالية غير صحيحة')
            }
            
            // محاكاة تحديث كلمة المرور
            user.password = newPassword
            
            return { success: true, message: 'تم تحديث كلمة المرور بنجاح' }
        } catch (error) {
            throw new Error(error.message || 'حدث خطأ في تحديث كلمة المرور')
        }
    },
    
    // إعادة تعيين كلمة المرور
    async resetPassword(username) {
        try {
            // محاكاة تأخير الشبكة
            await new Promise(resolve => setTimeout(resolve, 1500))
            
            const user = mockUsers.find(u => u.username === username)
            if (!user) {
                throw new Error('اسم المستخدم غير موجود')
            }
            
            // محاكاة إرسال رابط إعادة التعيين
            return { 
                success: true, 
                message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' 
            }
        } catch (error) {
            throw new Error(error.message || 'حدث خطأ في إعادة تعيين كلمة المرور')
        }
    }
}

// تصدير افتراضي
export default authService
