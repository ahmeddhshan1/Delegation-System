import { Navigate, useLocation } from 'react-router'
import { useAuth } from './AuthProvider'
import Loading from '../Loading'

const ProtectedRoute = ({ children }) => {
    const location = useLocation()
    const { isAuthenticated, loading } = useAuth()
    
    // عرض شاشة التحميل أثناء التحقق من المصادقة
    if (loading) {
        return <Loading message="جاري التحقق من المصادقة..." />
    }
    
    if (!isAuthenticated) {
        // حفظ الصفحة المطلوبة للعودة إليها بعد تسجيل الدخول
        return <Navigate to="/login" state={{ from: location }} replace />
    }
    
    return children
}

export default ProtectedRoute
