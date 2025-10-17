import { useLocation, useNavigate } from 'react-router'
import { useEffect, useState } from 'react'
import { Icon } from "@iconify/react/dist/iconify.js"
import { Button } from "@/components/ui/button"
import { usePermissions, useAuth } from '../../store/hooks'

// مكون حماية الصفحات
const PermissionGuard = ({ 
    children, 
    requiredPermissions = [], 
    requireAll = false,
    fallbackComponent = null,
    redirectTo = '/'
}) => {
    const location = useLocation()
    const navigate = useNavigate()
    const { userRole, checkPermission, checkAllPermissions, checkAnyPermission, roleInfo } = usePermissions()
    const { isAuthenticated } = useAuth()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // التحقق من حالة المصادقة
        if (typeof isAuthenticated === 'boolean') {
            setIsLoading(false)
        }
    }, [isAuthenticated])

    useEffect(() => {
        if (!isLoading && userRole) {
            // التحقق من إمكانية الوصول للصفحة الحالية
            // يمكن إضافة منطق التحقق من الصفحات هنا لاحقاً

            // التحقق من الصلاحيات المطلوبة
            if (requiredPermissions.length > 0) {
                const hasAccess = requireAll 
                    ? checkAllPermissions(requiredPermissions)
                    : checkAnyPermission(requiredPermissions)

                if (!hasAccess) {
                    navigate(redirectTo)
                    return
                }
            }
        }
    }, [userRole, isLoading, location.pathname, navigate, requiredPermissions, requireAll, redirectTo, checkAllPermissions, checkAnyPermission])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Icon icon="jam:refresh" className="animate-spin text-4xl mb-4" />
                    <p>جاري التحقق من الصلاحيات...</p>
                </div>
            </div>
        )
    }

    if (!userRole) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Icon icon="material-symbols:error" className="text-4xl text-red-500 mb-4" />
                    <h2 className="text-xl font-bold mb-2">خطأ في المصادقة</h2>
                    <p className="text-neutral-600 mb-4">لم يتم العثور على معلومات المستخدم</p>
                    <Button onClick={() => navigate('/login')}>
                        العودة لتسجيل الدخول
                    </Button>
                </div>
            </div>
        )
    }

    // التحقق من الصلاحيات
    if (requiredPermissions.length > 0) {
        const hasAccess = requireAll 
            ? checkAllPermissions(requiredPermissions)
            : checkAnyPermission(requiredPermissions)

        if (!hasAccess) {
            if (fallbackComponent) {
                return fallbackComponent
            }

            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center max-w-md">
                        <Icon icon="material-symbols:block" className="text-6xl text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold mb-2">غير مصرح لك بالوصول</h2>
                        <p className="text-neutral-600 mb-6">
                            ليس لديك الصلاحيات المطلوبة للوصول إلى هذه الصفحة
                        </p>
                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon icon="material-symbols:info" className="text-blue-500" />
                                <span className="font-medium">دورك الحالي:</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Icon icon={roleInfo?.icon} className={roleInfo?.color} />
                                <span className={roleInfo?.color}>{roleInfo?.name}</span>
                            </div>
                        </div>
                        <Button onClick={() => navigate(redirectTo)}>
                            العودة للصفحة الرئيسية
                        </Button>
                    </div>
                </div>
            )
        }
    }

    return children
}

// مكون حماية العناصر
const PermissionElement = ({ 
    children, 
    permission, 
    permissions = [], 
    requireAll = false,
    fallback = null
}) => {
    const { userRole, checkPermission, checkAllPermissions, checkAnyPermission } = usePermissions()

    if (!userRole) return fallback

    let hasAccess = false

    if (permission) {
        hasAccess = checkPermission(permission)
    } else if (permissions.length > 0) {
        hasAccess = requireAll 
            ? checkAllPermissions(permissions)
            : checkAnyPermission(permissions)
    }

    return hasAccess ? children : fallback
}

// مكون عرض معلومات المستخدم
const UserRoleInfo = () => {
    const { userRole, roleInfo } = usePermissions()

    if (!userRole || !roleInfo) return null

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${roleInfo.bgColor}`}>
            <Icon icon={roleInfo.icon} className={roleInfo.color} fontSize={16} />
            <span className={roleInfo.color}>{roleInfo.name}</span>
        </div>
    )
}

// مكون قائمة الصلاحيات
const PermissionsList = () => {
    const { userRole, roleInfo } = usePermissions()

    if (!userRole || !roleInfo) return null

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Icon icon={roleInfo.icon} className={roleInfo.color} fontSize={24} />
                <div>
                    <h3 className="font-semibold">{roleInfo.name}</h3>
                    <p className="text-sm text-neutral-600">{roleInfo.description}</p>
                </div>
            </div>
        </div>
    )
}

export { PermissionGuard, PermissionElement, UserRoleInfo, PermissionsList }
