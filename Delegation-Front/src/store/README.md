# Redux Store with Persist

## 📋 نظرة عامة

تم تطبيق Redux Toolkit مع Redux Persist لإدارة حالة التطبيق وحفظ البيانات محلياً.

## 🏗️ البنية

```
src/store/
├── index.js                 # إعدادات Store الرئيسية
├── persistConfig.js         # إعدادات Redux Persist
├── hooks.js                 # Custom Redux hooks
├── slices/
│   ├── authSlice.js         # إدارة المصادقة
│   ├── eventsSlice.js       # إدارة الأحداث
│   ├── delegationsSlice.js  # إدارة الوفود
│   ├── membersSlice.js      # إدارة الأعضاء
│   └── permissionsSlice.js  # إدارة الصلاحيات
└── README.md               # هذا الملف
```

## 🔧 المكونات

### 1. Store الرئيسي (index.js)
- إعداد Redux Store مع Redux Toolkit
- تكوين Redux Persist
- دمج جميع الـ reducers

### 2. إعدادات Persist (persistConfig.js)
- إعدادات التخزين لكل slice
- تحديد البيانات المحفوظة والغير محفوظة
- إدارة whitelist و blacklist

### 3. Custom Hooks (hooks.js)
- `useAuth()` - إدارة المصادقة
- `useEvents()` - إدارة الأحداث
- `useDelegations()` - إدارة الوفود
- `useMembers()` - إدارة الأعضاء
- `usePermissions()` - إدارة الصلاحيات

## 💾 البيانات المحفوظة

### ✅ محفوظة في localStorage:
- **Auth**: user, token, isAuthenticated, userRole
- **Permissions**: userRole, permissions, roleInfo
- **Events**: currentMainEvent, currentSubEvent
- **Delegations**: currentDelegation, selectedDelegation
- **Members**: currentMember, selectedMember

### ❌ غير محفوظة:
- **Loading states**: isLoading
- **Error states**: error
- **Large data**: mainEvents, subEvents, delegations, members
- **Admin sessions**: adminSession

## 🚀 الاستخدام

### في المكونات:
```javascript
import { useAuth, usePermissions } from '../store/hooks'

const MyComponent = () => {
  const { user, isAuthenticated } = useAuth()
  const { checkPermission } = usePermissions()
  
  return (
    <div>
      {checkPermission('MANAGE_EVENTS') && (
        <button>إدارة الأحداث</button>
      )}
    </div>
  )
}
```

### في Actions:
```javascript
import { useAppDispatch } from '../store/hooks'
import { setUser, login } from '../store/slices/authSlice'

const MyComponent = () => {
  const dispatch = useAppDispatch()
  
  const handleLogin = async () => {
    const result = await dispatch(login({ username, password }))
    // البيانات محفوظة تلقائياً
  }
}
```

## 🛠️ إدارة التخزين

### StorageManager:
```javascript
import StorageManager from '../utils/storageManager'

// مسح جميع البيانات
await StorageManager.clearAllStorage()

// مسح بيانات المصادقة فقط
await StorageManager.clearAuthStorage()

// الحصول على معلومات التخزين
const info = StorageManager.getStorageInfo()

// تصدير البيانات
const data = StorageManager.exportStoredData()
```

## 🔍 Debugging

### Redux DevTools:
- متاحة في وضع التطوير
- عرض جميع الـ actions
- Time-travel debugging

### Storage Inspection:
- Developer Tools → Application → Local Storage
- فحص المفاتيح: persist:auth, persist:permissions, etc.

## ⚡ Performance

### Optimizations:
- تحديثات مستهدفة فقط
- تقليل إعادة التصيير
- تخزين انتقائي للبيانات

### Best Practices:
- تجنب حفظ البيانات الكبيرة
- استخدام whitelist/blacklist
- مسح البيانات عند تسجيل الخروج

## 🧪 Testing

### مكونات الاختبار:
- `ReduxPersistTest` - اختبار وظائف الحفظ
- `StorageManager` - إدارة التخزين
- `ReduxPersistStatus` - عرض حالة التخزين

### خطوات الاختبار:
1. تسجيل دخول تجريبي
2. إعادة تحميل الصفحة
3. التحقق من استمرارية البيانات
4. تسجيل خروج
5. التحقق من مسح البيانات

## 📝 ملاحظات مهمة

1. **الأمان**: لا يتم حفظ كلمات المرور أو بيانات حساسة
2. **الأداء**: البيانات الكبيرة غير محفوظة لتجنب بطء التطبيق
3. **التوافق**: يعمل مع جميع المتصفحات الحديثة
4. **الصيانة**: مسح البيانات تلقائياً عند تسجيل الخروج

## 🔄 التحديثات المستقبلية

- [ ] إضافة TypeScript support
- [ ] تحسين إدارة الأخطاء
- [ ] إضافة compression للبيانات
- [ ] دعم sessionStorage
- [ ] إضافة encryption للبيانات الحساسة
