import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchUserPermissions } from '../../store/slices/usersSlice'
import { authService } from '../../plugins/auth'

const PermissionCheck = ({ 
    children, 
    permission, 
    permissions = [], 
    fallback = null,
    showLoading = true 
}) => {
    const [hasPermission, setHasPermission] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let isMounted = true // flag لتتبع حالة المكون
        
        const checkPermissions = async () => {
            try {
                if (isMounted) {
                    setLoading(true)
                    setError(null)
                }

                if (permission) {
                    // فحص صلاحية واحدة
                    const response = await authService.checkPermission(permission)
                    if (isMounted) {
                        setHasPermission(response.has_permission)
                    }
                } else if (permissions.length > 0) {
                    // فحص عدة صلاحيات (OR logic)
                    const checks = await Promise.all(
                        permissions.map(p => authService.checkPermission(p))
                    )
                    if (isMounted) {
                        setHasPermission(checks.some(check => check.has_permission))
                    }
                } else {
                    // إذا لم يتم تحديد صلاحيات، السماح بالوصول
                    if (isMounted) {
                        setHasPermission(true)
                    }
                }
            } catch (err) {
                console.error('Permission check error:', err)
                if (isMounted) {
                    setError(err.message)
                    setHasPermission(false)
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        checkPermissions()
        
        return () => {
            isMounted = false // تعيين flag إلى false عند cleanup
        }
    }, [permission, permissions])

    if (loading && showLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    if (error) {
        console.warn('Permission check failed:', error)
        return fallback
    }

    return hasPermission ? children : fallback
}

export default PermissionCheck



