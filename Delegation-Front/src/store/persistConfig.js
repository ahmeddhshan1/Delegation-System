import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // localStorage
import { combineReducers } from '@reduxjs/toolkit'

// إعدادات التخزين العامة
const rootPersistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'permissions'], // حفظ المصادقة والصلاحيات فقط
  blacklist: ['events', 'delegations', 'members'] // عدم حفظ البيانات الكبيرة
}

// إعدادات تخزين المصادقة
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token', 'isAuthenticated', 'userRole'], // حفظ البيانات المهمة
  blacklist: ['isLoading', 'error', 'adminSession'] // عدم حفظ الحالات المؤقتة
}

// إعدادات تخزين الصلاحيات
const permissionsPersistConfig = {
  key: 'permissions',
  storage,
  whitelist: ['userRole', 'permissions', 'roleInfo', 'isSuperAdmin', 'isAdmin', 'isUser'], // حفظ الصلاحيات
  blacklist: [] // حفظ جميع بيانات الصلاحيات
}

// إعدادات تخزين الأحداث (اختياري - لحفظ الأحداث المفتوحة)
const eventsPersistConfig = {
  key: 'events',
  storage,
  whitelist: ['mainEvents', 'subEvents', 'currentMainEvent', 'currentSubEvent', 'selectedMainEvent', 'selectedSubEvent'], // حفظ البيانات المهمة
  blacklist: ['isLoading', 'error'] // عدم حفظ الحالات المؤقتة
}

// إعدادات تخزين الوفود (اختياري - لحفظ الوفد المفتوح)
const delegationsPersistConfig = {
  key: 'delegations',
  storage,
  whitelist: ['delegations', 'departureSessions', 'currentDelegation', 'selectedDelegation'], // حفظ البيانات المهمة
  blacklist: ['isLoading', 'error', 'stats'] // عدم حفظ الحالات المؤقتة
}

// إعدادات تخزين الأعضاء (اختياري - لحفظ العضو المفتوح)
const membersPersistConfig = {
  key: 'members',
  storage,
  whitelist: ['members', 'allMembers', 'currentMember', 'selectedMember'], // حفظ البيانات المهمة
  blacklist: ['isLoading', 'error', 'stats'] // عدم حفظ الحالات المؤقتة
}

export {
  rootPersistConfig,
  authPersistConfig,
  permissionsPersistConfig,
  eventsPersistConfig,
  delegationsPersistConfig,
  membersPersistConfig
}
