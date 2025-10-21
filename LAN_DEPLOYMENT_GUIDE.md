# دليل تشغيل النظام على الشبكة المحلية (LAN)

## 🚀 **نظرة عامة**
نظام إدارة الوفود جاهز للتشغيل على الشبكة المحلية مع دعم كامل للوصول من أجهزة متعددة.

## 📋 **المتطلبات**
- Python 3.8+
- Node.js 16+
- PostgreSQL
- Windows 10/11

## 🔧 **التشغيل السريع**

### 1. **تشغيل Backend (Django)**
```bash
cd Delegation-Backend
start_lan_fixed.bat
```

### 2. **تشغيل Frontend (React)**
```bash
cd Delegation-Front
start_lan_fixed.bat
```

## 🌐 **الوصول للنظام**

### **من نفس الكمبيوتر:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api`
- Django Admin: `http://localhost:8000/admin`

### **من الأجهزة الأخرى على نفس الشبكة:**
- Frontend: `http://10.10.10.35:5173`
- Backend API: `http://10.10.10.35:8000/api`
- Django Admin: `http://10.10.10.35:8000/admin`

## 👥 **أدوار المستخدمين**

### **SUPER_ADMIN**
- إدارة كاملة للنظام
- الوصول لـ Django Admin
- إدارة المستخدمين
- جميع الصلاحيات

### **ADMIN**
- إدارة البيانات
- عرض التقارير
- لا يمكن الوصول لـ Django Admin

### **USER**
- إضافة البيانات
- عرض البيانات
- صلاحيات محدودة

## 🔒 **الأمان**
- مصادقة قائمة على الرموز (Token Authentication)
- جلسات آمنة للـ Django Admin
- تسجيل جميع العمليات (Audit Logging)
- حماية CSRF

## 🛠️ **استكشاف الأخطاء**

### **إذا لم يعمل الوصول من الأجهزة الأخرى:**
1. تأكد من أن جميع الأجهزة على نفس الشبكة
2. تحقق من جدار الحماية - أضف استثناء للمنافذ 8000 و 5173
3. تأكد من عنوان IP الصحيح

### **إذا لم تظهر الـ CSS في Django Admin:**
- تم إصلاح هذه المشكلة تلقائياً في `start_lan_fixed.bat`

### **إذا فشل الاتصال بقاعدة البيانات:**
- تأكد من تشغيل PostgreSQL
- تحقق من بيانات الاتصال في `settings.py`

## 📁 **هيكل المشروع**
```
Delegation-System/
├── Delegation-Backend/          # Django Backend
│   ├── start_lan_fixed.bat     # تشغيل Backend
│   ├── get_network_info.bat    # معلومات الشبكة
│   └── ...
├── Delegation-Front/            # React Frontend
│   ├── start_lan_fixed.bat     # تشغيل Frontend
│   └── ...
└── LAN_DEPLOYMENT_GUIDE.md     # هذا الدليل
```

## 🎯 **المميزات**
- ✅ وصول متعدد من أجهزة مختلفة
- ✅ تصميم متجاوب (Responsive)
- ✅ دعم اللغة العربية
- ✅ نظام صلاحيات متقدم
- ✅ تقارير PDF
- ✅ تسجيل العمليات
- ✅ واجهة إدارة Django

## 📞 **الدعم**
في حالة وجود مشاكل، تأكد من:
1. تشغيل الخوادم بالترتيب الصحيح
2. فتح المنافذ المطلوبة
3. استخدام العنوان الصحيح للشبكة

---
**تم تطوير النظام بواسطة فريق التطوير** 🚀
