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
  whitelist: ['currentMainEvent', 'currentSubEvent', 'selectedMainEvent', 'selectedSubEvent'], // حفظ الأحداث المحددة
  blacklist: ['mainEvents', 'subEvents', 'isLoading', 'error'] // عدم حفظ البيانات الكبيرة
}

// إعدادات تخزين الوفود (اختياري - لحفظ الوفد المفتوح)
const delegationsPersistConfig = {
  key: 'delegations',
  storage,
  whitelist: ['currentDelegation', 'selectedDelegation'], // حفظ الوفد المحدد
  blacklist: ['delegations', 'departureSessions', 'isLoading', 'error', 'stats'] // عدم حفظ البيانات الكبيرة
}

// إعدادات تخزين الأعضاء (اختياري - لحفظ العضو المفتوح)
const membersPersistConfig = {
  key: 'members',
  storage,
  whitelist: ['currentMember', 'selectedMember'], // حفظ العضو المحدد
  blacklist: ['members', 'allMembers', 'isLoading', 'error', 'stats'] // عدم حفظ البيانات الكبيرة
}

export {
  rootPersistConfig,
  authPersistConfig,
  permissionsPersistConfig,
  eventsPersistConfig,
  delegationsPersistConfig,
  membersPersistConfig
}
