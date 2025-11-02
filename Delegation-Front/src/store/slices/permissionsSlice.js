import { createSlice } from '@reduxjs/toolkit'
import { USER_ROLES, PERMISSIONS, ROLE_PERMISSIONS } from '../../utils/permissions'
import { PURGE } from 'redux-persist'

const initialState = {
  userRole: null,
  permissions: [],
  roleInfo: null,
  isSuperAdmin: false,
  isAdmin: false,
  isUser: false,
  canManageUsers: false,
  canViewReports: false,
  canPrintReports: false,
  canDeleteData: false
}

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    setUserRole: (state, action) => {
      const role = action.payload
      state.userRole = role
      state.permissions = ROLE_PERMISSIONS[role] || []
      state.isSuperAdmin = role === USER_ROLES.SUPER_ADMIN
      state.isAdmin = role === USER_ROLES.ADMIN
      state.isUser = role === USER_ROLES.USER
      
      // Set specific permissions
      state.canManageUsers = state.permissions.includes(PERMISSIONS.MANAGE_USERS)
      state.canViewReports = state.permissions.includes(PERMISSIONS.VIEW_REPORTS)
      state.canPrintReports = state.permissions.includes(PERMISSIONS.PRINT_REPORTS)
      state.canDeleteData = state.permissions.includes(PERMISSIONS.DELETE_DELEGATIONS) ||
                           state.permissions.includes(PERMISSIONS.DELETE_MEMBERS) ||
                           state.permissions.includes(PERMISSIONS.DELETE_DEPARTURES)
      
      // Set role info
      state.roleInfo = {
        name: role === USER_ROLES.SUPER_ADMIN ? 'مدير النظام' :
              role === USER_ROLES.ADMIN ? 'مدير' : 'مستخدم',
        description: role === USER_ROLES.SUPER_ADMIN ? 'صلاحيات كاملة على جميع أجزاء النظام' :
                     role === USER_ROLES.ADMIN ? 'صلاحيات كاملة على الفرونت إند (بدون إعدادات النظام)' :
                     'صلاحيات محدودة: إضافة وفود وأعضاء ومغادرات فقط',
        color: role === USER_ROLES.SUPER_ADMIN ? 'text-red-600' :
               role === USER_ROLES.ADMIN ? 'text-blue-600' : 'text-green-600',
        bgColor: role === USER_ROLES.SUPER_ADMIN ? 'bg-red-50' :
                 role === USER_ROLES.ADMIN ? 'bg-blue-50' : 'bg-green-50',
        icon: role === USER_ROLES.SUPER_ADMIN ? 'Settings' :
              role === USER_ROLES.ADMIN ? 'Shield' : 'User'
      }
    },
    
    clearPermissions: (state) => {
      state.userRole = null
      state.permissions = []
      state.roleInfo = null
      state.isSuperAdmin = false
      state.isAdmin = false
      state.isUser = false
      state.canManageUsers = false
      state.canViewReports = false
      state.canPrintReports = false
      state.canDeleteData = false
    },
    
    // مسح جميع البيانات المحفوظة
    purgeAllData: (state, action) => {
      return initialState
    },
    
    // Permission check helpers
    hasPermission: (state, action) => {
      const permission = action.payload
      return state.permissions.includes(permission)
    },
    
    hasAllPermissions: (state, action) => {
      const permissions = action.payload
      return permissions.every(permission => state.permissions.includes(permission))
    },
    
    hasAnyPermission: (state, action) => {
      const permissions = action.payload
      return permissions.some(permission => state.permissions.includes(permission))
    }
  }
})

export const {
  setUserRole,
  clearPermissions,
  purgeAllData,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission
} = permissionsSlice.actions

export default permissionsSlice.reducer
