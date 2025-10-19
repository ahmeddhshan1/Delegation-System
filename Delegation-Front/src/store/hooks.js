import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch()
export const useAppSelector = useSelector

// Auth hooks
export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  
  return {
    ...auth,
    dispatch
  }
}

// Events hooks
export const useEvents = () => {
  const events = useAppSelector((state) => state.events)
  const dispatch = useAppDispatch()
  
  return {
    ...events,
    dispatch
  }
}

// Delegations hooks
export const useDelegations = () => {
  const delegations = useAppSelector((state) => state.delegations)
  const dispatch = useAppDispatch()
  
  return {
    ...delegations,
    dispatch
  }
}

// Members hooks
export const useMembers = () => {
  const members = useAppSelector((state) => state.members)
  const dispatch = useAppDispatch()
  
  return {
    ...members,
    dispatch
  }
}

// Permissions hooks
export const usePermissions = () => {
  const auth = useAppSelector((state) => state.auth)
  const permissions = useAppSelector((state) => state.permissions)
  const dispatch = useAppDispatch()
  
  // جلب الدور من localStorage كـ fallback
  const userRole = auth.userRole || localStorage.getItem('userRole') || 'USER'
  
  const checkPermission = useCallback((permission) => {
    // إذا كان المستخدم Super Admin، لديه جميع الصلاحيات
    if (userRole === 'SUPER_ADMIN') {
      return true
    }
    
    // إذا كان المستخدم Admin، لديه نفس صلاحيات SUPER_ADMIN عدا إعدادات النظام
    if (userRole === 'ADMIN') {
      // ADMIN له كل الصلاحيات عدا SYSTEM_SETTINGS
      const restrictedPermissions = ['SYSTEM_SETTINGS']
      return !restrictedPermissions.includes(permission)
    }
    
    // إذا كان المستخدم User، لديه صلاحيات محدودة
    if (userRole === 'USER') {
      const userPermissions = [
        'VIEW_EVENTS', 'VIEW_DELEGATIONS', 'ADD_DELEGATIONS', 'VIEW_MEMBERS',
        'ADD_MEMBERS', 'VIEW_DEPARTURES', 'ADD_DEPARTURES', 'USE_FILTERS'
      ]
      return userPermissions.includes(permission)
    }
    
    // التحقق من الصلاحيات المحفوظة كـ fallback
    return permissions.permissions.includes(permission)
  }, [permissions.permissions, userRole])
  
  const checkAllPermissions = useCallback((permissionsList) => {
    // إذا كان المستخدم Super Admin، لديه جميع الصلاحيات
    if (userRole === 'SUPER_ADMIN') {
      return true
    }
    
    return permissionsList.every(permission => checkPermission(permission))
  }, [userRole, checkPermission])
  
  const checkAnyPermission = useCallback((permissionsList) => {
    // إذا كان المستخدم Super Admin، لديه جميع الصلاحيات
    if (userRole === 'SUPER_ADMIN') {
      return true
    }
    
    return permissionsList.some(permission => checkPermission(permission))
  }, [userRole, checkPermission])
  
  // Get role info
  const getRoleInfo = () => {
    const roleInfo = {
      'SUPER_ADMIN': {
        name: 'مدير النظام',
        description: 'صلاحيات كاملة على جميع أجزاء النظام',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: 'material-symbols:admin-panel-settings'
      },
      'ADMIN': {
        name: 'مدير',
        description: 'صلاحيات كاملة على الفرونت إند (بدون إعدادات النظام)',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: 'material-symbols:shield-person'
      },
      'USER': {
        name: 'مستخدم',
        description: 'صلاحيات محدودة: إضافة وفود وأعضاء ومغادرات فقط',
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

  return {
    ...permissions,
    userRole,
    roleInfo: getRoleInfo(),
    dispatch,
    checkPermission,
    checkAllPermissions,
    checkAnyPermission
  }
}

// Combined hooks for common use cases
export const useCurrentUser = () => {
  const { user, userRole, isAuthenticated } = useAuth()
  const { checkPermission, isSuperAdmin, isAdmin, isUser } = usePermissions()
  
  return {
    user,
    userRole,
    isAuthenticated,
    checkPermission,
    isSuperAdmin,
    isAdmin,
    isUser
  }
}

export const useAppState = () => {
  const auth = useAuth()
  const events = useEvents()
  const delegations = useDelegations()
  const members = useMembers()
  const permissions = usePermissions()
  
  return {
    auth,
    events,
    delegations,
    members,
    permissions
  }
}
