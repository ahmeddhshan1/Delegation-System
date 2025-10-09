import { useLocation, useNavigate } from 'react-router'
import { useEffect, useState } from 'react'
import { Icon } from "@iconify/react/dist/iconify.js"
import { Button } from "@/components/ui/button"
import { 
    hasPermission, 
    hasAllPermissions, 
    hasAnyPermission,
    canAccessCurrentPage,
    getRoleInfo,
    USER_ROLES 
} from '../../utils/permissions'

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
    const [userRole, setUserRole] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // محاكاة جلب دور المستخدم - في الواقع ستأتي من API أو localStorage
        const mockUserRole = localStorage.getItem('userRole') || USER_ROLES.ADMIN
        setUserRole(mockUserRole)
        setIsLoading(false)
    }, [])

    useEffect(() => {
        if (!isLoading && userRole) {
            // التحقق من إمكانية الوصول للصفحة الحالية
            if (!canAccessCurrentPage(userRole, location.pathname)) {
                navigate(redirectTo)
                return
            }

            // التحقق من الصلاحيات المطلوبة
            if (requiredPermissions.length > 0) {
                const hasAccess = requireAll 
                    ? hasAllPermissions(userRole, requiredPermissions)
                    : hasAnyPermission(userRole, requiredPermissions)

                if (!hasAccess) {
                    navigate(redirectTo)
                    return
                }
            }
        }
    }, [userRole, isLoading, location.pathname, navigate, requiredPermissions, requireAll, redirectTo])

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
            ? hasAllPermissions(userRole, requiredPermissions)
            : hasAnyPermission(userRole, requiredPermissions)

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
                                <Icon icon={getRoleInfo(userRole).icon} className={getRoleInfo(userRole).color} />
                                <span className={getRoleInfo(userRole).color}>{getRoleInfo(userRole).name}</span>
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
    fallback = null,
    userRole = null
}) => {
    const [currentUserRole, setCurrentUserRole] = useState(userRole)

    useEffect(() => {
        if (!userRole) {
            const mockUserRole = localStorage.getItem('userRole') || USER_ROLES.ADMIN
            setCurrentUserRole(mockUserRole)
        } else {
            setCurrentUserRole(userRole)
        }
    }, [userRole])

    if (!currentUserRole) return fallback

    let hasAccess = false

    if (permission) {
        hasAccess = hasPermission(currentUserRole, permission)
    } else if (permissions.length > 0) {
        hasAccess = requireAll 
            ? hasAllPermissions(currentUserRole, permissions)
            : hasAnyPermission(currentUserRole, permissions)
    }

    return hasAccess ? children : fallback
}

// مكون عرض معلومات المستخدم
const UserRoleInfo = ({ userRole = null }) => {
    const [currentUserRole, setCurrentUserRole] = useState(userRole)

    useEffect(() => {
        if (!userRole) {
            const mockUserRole = localStorage.getItem('userRole') || USER_ROLES.ADMIN
            setCurrentUserRole(mockUserRole)
        } else {
            setCurrentUserRole(userRole)
        }
    }, [userRole])

    if (!currentUserRole) return null

    const roleInfo = getRoleInfo(currentUserRole)

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${roleInfo.bgColor}`}>
            <Icon icon={roleInfo.icon} className={roleInfo.color} fontSize={16} />
            <span className={roleInfo.color}>{roleInfo.name}</span>
        </div>
    )
}

// مكون قائمة الصلاحيات
const PermissionsList = ({ userRole = null }) => {
    const [currentUserRole, setCurrentUserRole] = useState(userRole)

    useEffect(() => {
        if (!userRole) {
            const mockUserRole = localStorage.getItem('userRole') || USER_ROLES.ADMIN
            setCurrentUserRole(mockUserRole)
        } else {
            setCurrentUserRole(userRole)
        }
    }, [userRole])

    if (!currentUserRole) return null

    const roleInfo = getRoleInfo(currentUserRole)

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
