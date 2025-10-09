// نظام إدارة الصلاحيات في الفرونت إند

// أدوار المستخدمين
export const USER_ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    USER: 'user'
}

// الصلاحيات المتاحة
export const PERMISSIONS = {
    // إدارة المستخدمين
    MANAGE_USERS: 'manage_users',
    
    // إدارة الأحداث
    MANAGE_EVENTS: 'manage_events',
    VIEW_EVENTS: 'view_events',
    
    // إدارة الوفود
    MANAGE_DELEGATIONS: 'manage_delegations',
    VIEW_DELEGATIONS: 'view_delegations',
    ADD_DELEGATIONS: 'add_delegations',
    EDIT_DELEGATIONS: 'edit_delegations',
    DELETE_DELEGATIONS: 'delete_delegations',
    
    // إدارة الأعضاء
    MANAGE_MEMBERS: 'manage_members',
    VIEW_MEMBERS: 'view_members',
    ADD_MEMBERS: 'add_members',
    EDIT_MEMBERS: 'edit_members',
    DELETE_MEMBERS: 'delete_members',
    
    // إدارة المغادرات
    MANAGE_DEPARTURES: 'manage_departures',
    VIEW_DEPARTURES: 'view_departures',
    ADD_DEPARTURES: 'add_departures',
    EDIT_DEPARTURES: 'edit_departures',
    DELETE_DEPARTURES: 'delete_departures',
    
    // التقارير والتصدير
    VIEW_REPORTS: 'view_reports',
    EXPORT_REPORTS: 'export_reports',
    PRINT_REPORTS: 'print_reports',
    
    // الفلترة والبحث
    USE_FILTERS: 'use_filters',
    ADVANCED_SEARCH: 'advanced_search',
    
    // إدارة النظام
    SYSTEM_SETTINGS: 'system_settings',
    AUDIT_LOGS: 'audit_logs'
}

// خريطة الصلاحيات لكل دور
export const ROLE_PERMISSIONS = {
    [USER_ROLES.SUPER_ADMIN]: [
        // جميع الصلاحيات
        ...Object.values(PERMISSIONS)
    ],
    
    [USER_ROLES.ADMIN]: [
        // إدارة الأحداث
        PERMISSIONS.MANAGE_EVENTS,
        PERMISSIONS.VIEW_EVENTS,
        
        // إدارة الوفود
        PERMISSIONS.MANAGE_DELEGATIONS,
        PERMISSIONS.VIEW_DELEGATIONS,
        PERMISSIONS.ADD_DELEGATIONS,
        PERMISSIONS.EDIT_DELEGATIONS,
        PERMISSIONS.DELETE_DELEGATIONS,
        
        // إدارة الأعضاء
        PERMISSIONS.MANAGE_MEMBERS,
        PERMISSIONS.VIEW_MEMBERS,
        PERMISSIONS.ADD_MEMBERS,
        PERMISSIONS.EDIT_MEMBERS,
        PERMISSIONS.DELETE_MEMBERS,
        
        // إدارة المغادرات
        PERMISSIONS.MANAGE_DEPARTURES,
        PERMISSIONS.VIEW_DEPARTURES,
        PERMISSIONS.ADD_DEPARTURES,
        PERMISSIONS.EDIT_DEPARTURES,
        PERMISSIONS.DELETE_DEPARTURES,
        
        // التقارير والتصدير
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.EXPORT_REPORTS,
        PERMISSIONS.PRINT_REPORTS,
        
        // الفلترة والبحث
        PERMISSIONS.USE_FILTERS,
        PERMISSIONS.ADVANCED_SEARCH,
        
        // إدارة النظام
        PERMISSIONS.SYSTEM_SETTINGS,
        PERMISSIONS.AUDIT_LOGS
    ],
    
    [USER_ROLES.USER]: [
        // عرض الأحداث
        PERMISSIONS.VIEW_EVENTS,
        
        // إدارة الوفود (محدودة)
        PERMISSIONS.VIEW_DELEGATIONS,
        PERMISSIONS.ADD_DELEGATIONS,
        PERMISSIONS.EDIT_DELEGATIONS,
        
        // إدارة الأعضاء (محدودة)
        PERMISSIONS.VIEW_MEMBERS,
        PERMISSIONS.ADD_MEMBERS,
        PERMISSIONS.EDIT_MEMBERS,
        
        // إدارة المغادرات (محدودة)
        PERMISSIONS.VIEW_DEPARTURES,
        PERMISSIONS.ADD_DEPARTURES,
        PERMISSIONS.EDIT_DEPARTURES,
        
        // الفلترة والبحث
        PERMISSIONS.USE_FILTERS,
        PERMISSIONS.ADVANCED_SEARCH
    ]
}

// دالة للتحقق من الصلاحية
export const hasPermission = (userRole, permission) => {
    if (!userRole || !permission) return false
    
    const rolePermissions = ROLE_PERMISSIONS[userRole] || []
    return rolePermissions.includes(permission)
}

// دالة للتحقق من عدة صلاحيات (AND)
export const hasAllPermissions = (userRole, permissions) => {
    if (!userRole || !permissions || !Array.isArray(permissions)) return false
    
    return permissions.every(permission => hasPermission(userRole, permission))
}

// دالة للتحقق من عدة صلاحيات (OR)
export const hasAnyPermission = (userRole, permissions) => {
    if (!userRole || !permissions || !Array.isArray(permissions)) return false
    
    return permissions.some(permission => hasPermission(userRole, permission))
}

// دالة للحصول على صلاحيات المستخدم
export const getUserPermissions = (userRole) => {
    if (!userRole) return []
    
    return ROLE_PERMISSIONS[userRole] || []
}

// دالة للتحقق من الدور
export const hasRole = (userRole, requiredRole) => {
    if (!userRole || !requiredRole) return false
    
    return userRole === requiredRole
}

// دالة للتحقق من عدة أدوار
export const hasAnyRole = (userRole, requiredRoles) => {
    if (!userRole || !requiredRoles || !Array.isArray(requiredRoles)) return false
    
    return requiredRoles.includes(userRole)
}

// دالة للحصول على معلومات الدور
export const getRoleInfo = (userRole) => {
    const roleInfo = {
        [USER_ROLES.SUPER_ADMIN]: {
            name: 'مدير النظام',
            description: 'صلاحيات كاملة على جميع أجزاء النظام',
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            icon: 'material-symbols:admin-panel-settings'
        },
        [USER_ROLES.ADMIN]: {
            name: 'مدير',
            description: 'صلاحيات كاملة على الفرونت إند',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            icon: 'material-symbols:shield-person'
        },
        [USER_ROLES.USER]: {
            name: 'مستخدم',
            description: 'صلاحيات محدودة للعرض والإضافة',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            icon: 'material-symbols:person'
        }
    }
    
    return roleInfo[userRole] || {
        name: 'غير محدد',
        description: 'دور غير معروف',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        icon: 'material-symbols:help'
    }
}

// دالة للتحقق من إمكانية الوصول للصفحة
export const canAccessPage = (userRole, pagePermissions) => {
    if (!pagePermissions || pagePermissions.length === 0) return true
    
    return hasAnyPermission(userRole, pagePermissions)
}

// صلاحيات الصفحات
export const PAGE_PERMISSIONS = {
    '/': [PERMISSIONS.VIEW_EVENTS],
    // الصلاحيات للأحداث ديناميكية - يتم إضافتها تلقائياً
    '/all-members': [PERMISSIONS.VIEW_MEMBERS],
    '/events-management': [PERMISSIONS.MANAGE_EVENTS],
    '/category/:categoryId': [PERMISSIONS.VIEW_EVENTS],
    '/category/:categoryId/event/:eventId': [PERMISSIONS.VIEW_DELEGATIONS]
}

// دالة ديناميكية لإضافة صلاحيات الأحداث
export const getDynamicPagePermissions = (path) => {
    try {
        const eventCategories = JSON.parse(localStorage.getItem('eventCategories') || '[]')
        
        // البحث عن حدث رئيسي يطابق المسار
        for (const category of eventCategories) {
            const categoryPath = category.englishName?.toLowerCase().replace(/\s+/g, '') || 
                               category.name.toLowerCase().replace(/\s+/g, '').replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '')
            
            if (path.startsWith(`/${categoryPath}`)) {
                return [PERMISSIONS.VIEW_DELEGATIONS]
            }
        }
        
        return null
    } catch (error) {
        console.error('خطأ في جلب صلاحيات الصفحة الديناميكية:', error)
        return null
    }
}

// دالة للتحقق من إمكانية الوصول للصفحة الحالية (محدثة لدعم ديناميكي)
export const canAccessCurrentPage = (userRole, currentPath) => {
    // البحث عن الصلاحيات المطلوبة للصفحة
    let pagePermissions = PAGE_PERMISSIONS[currentPath]
    
    // إذا لم توجد صلاحيات ثابتة، جرب الصلاحيات الديناميكية
    if (!pagePermissions) {
        pagePermissions = getDynamicPagePermissions(currentPath)
    }
    
    if (!pagePermissions) return true // إذا لم تكن الصفحة محددة، السماح بالوصول
    
    return canAccessPage(userRole, pagePermissions)
}
