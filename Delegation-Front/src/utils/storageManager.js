import { persistor } from '../store'
import { PURGE } from 'redux-persist'

// إدارة التخزين المحلي
export class StorageManager {
  
  // مسح جميع البيانات المحفوظة
  static async clearAllStorage() {
    try {
      await persistor.purge()
      localStorage.clear()
      sessionStorage.clear()
      console.log('تم مسح جميع البيانات المحفوظة')
    } catch (error) {
      console.error('خطأ في مسح البيانات المحفوظة:', error)
    }
  }

  // مسح بيانات مصادقة معينة
  static async clearAuthStorage() {
    try {
      // مسح بيانات المصادقة من localStorage
      localStorage.removeItem('persist:auth')
      localStorage.removeItem('persist:permissions')
      console.log('تم مسح بيانات المصادقة')
    } catch (error) {
      console.error('خطأ في مسح بيانات المصادقة:', error)
    }
  }

  // مسح بيانات أحداث معينة
  static async clearEventsStorage() {
    try {
      localStorage.removeItem('persist:events')
      console.log('تم مسح بيانات الأحداث')
    } catch (error) {
      console.error('خطأ في مسح بيانات الأحداث:', error)
    }
  }

  // مسح بيانات وفود معينة
  static async clearDelegationsStorage() {
    try {
      localStorage.removeItem('persist:delegations')
      console.log('تم مسح بيانات الوفود')
    } catch (error) {
      console.error('خطأ في مسح بيانات الوفود:', error)
    }
  }

  // مسح بيانات أعضاء معينة
  static async clearMembersStorage() {
    try {
      localStorage.removeItem('persist:members')
      console.log('تم مسح بيانات الأعضاء')
    } catch (error) {
      console.error('خطأ في مسح بيانات الأعضاء:', error)
    }
  }

  // الحصول على حجم التخزين المستخدم
  static getStorageSize() {
    try {
      const localStorageSize = new Blob(Object.values(localStorage)).size
      const sessionStorageSize = new Blob(Object.values(sessionStorage)).size
      
      return {
        localStorage: localStorageSize,
        sessionStorage: sessionStorageSize,
        total: localStorageSize + sessionStorageSize
      }
    } catch (error) {
      console.error('خطأ في حساب حجم التخزين:', error)
      return { localStorage: 0, sessionStorage: 0, total: 0 }
    }
  }

  // تنسيق حجم التخزين للعرض
  static formatStorageSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // التحقق من وجود بيانات محفوظة
  static hasStoredData() {
    try {
      const persistKeys = Object.keys(localStorage).filter(key => key.startsWith('persist:'))
      return persistKeys.length > 0
    } catch (error) {
      console.error('خطأ في التحقق من البيانات المحفوظة:', error)
      return false
    }
  }

  // الحصول على معلومات التخزين
  static getStorageInfo() {
    try {
      const persistKeys = Object.keys(localStorage).filter(key => key.startsWith('persist:'))
      const storageSize = this.getStorageSize()
      
      return {
        hasStoredData: persistKeys.length > 0,
        persistKeys,
        storageSize: {
          ...storageSize,
          formatted: {
            localStorage: this.formatStorageSize(storageSize.localStorage),
            sessionStorage: this.formatStorageSize(storageSize.sessionStorage),
            total: this.formatStorageSize(storageSize.total)
          }
        }
      }
    } catch (error) {
      console.error('خطأ في الحصول على معلومات التخزين:', error)
      return {
        hasStoredData: false,
        persistKeys: [],
        storageSize: { localStorage: 0, sessionStorage: 0, total: 0 }
      }
    }
  }

  // تصدير البيانات المحفوظة
  static exportStoredData() {
    try {
      const persistKeys = Object.keys(localStorage).filter(key => key.startsWith('persist:'))
      const exportedData = {}
      
      persistKeys.forEach(key => {
        exportedData[key] = localStorage.getItem(key)
      })
      
      return JSON.stringify(exportedData, null, 2)
    } catch (error) {
      console.error('خطأ في تصدير البيانات المحفوظة:', error)
      return null
    }
  }

  // استيراد البيانات المحفوظة
  static importStoredData(jsonData) {
    try {
      const importedData = JSON.parse(jsonData)
      
      Object.keys(importedData).forEach(key => {
        localStorage.setItem(key, importedData[key])
      })
      
      console.log('تم استيراد البيانات المحفوظة بنجاح')
      return true
    } catch (error) {
      console.error('خطأ في استيراد البيانات المحفوظة:', error)
      return false
    }
  }
}

export default StorageManager
