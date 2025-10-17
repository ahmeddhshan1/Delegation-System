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
    
    // التحقق من الصلاحيات المحفوظة
    return permissions.permissions.includes(permission)
  }, [permissions.permissions, userRole])
  
  const checkAllPermissions = useCallback((permissionsList) => {
    // إذا كان المستخدم Super Admin، لديه جميع الصلاحيات
    if (userRole === 'SUPER_ADMIN') {
      return true
    }
    
    return permissionsList.every(permission => permissions.permissions.includes(permission))
  }, [permissions.permissions, userRole])
  
  const checkAnyPermission = useCallback((permissionsList) => {
    // إذا كان المستخدم Super Admin، لديه جميع الصلاحيات
    if (userRole === 'SUPER_ADMIN') {
      return true
    }
    
    return permissionsList.some(permission => permissions.permissions.includes(permission))
  }, [permissions.permissions, userRole])
  
  return {
    ...permissions,
    userRole,
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
