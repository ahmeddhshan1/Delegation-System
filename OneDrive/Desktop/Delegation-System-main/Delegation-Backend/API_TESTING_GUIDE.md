# 🧪 دليل اختبار API باستخدام Postman

## 📋 المتطلبات

1. **Postman** مثبت على جهازك
2. **خادم Django** يعمل على `http://localhost:8000`
3. **بيانات المستخدمين** موجودة في قاعدة البيانات

## 🚀 خطوات الاختبار

### 1. إعداد Postman

1. **استيراد Collection**:
   - افتح Postman
   - اضغط على "Import"
   - اختر ملف `postman_collection.json`

2. **استيراد Environment**:
   - في Postman، اضغط على "Environments"
   - اضغط "Import"
   - اختر ملف `postman_environment.json`
   - تأكد من اختيار Environment "Delegation System Environment"

### 2. تشغيل الخادم

```bash
cd Delegation-Backend
python manage.py runserver
```

### 3. اختبار API بالترتيب

#### 🔐 الخطوة 1: تسجيل الدخول

1. **اختر**: `Authentication > Login`
2. **اضغط**: Send
3. **تحقق من**: 
   - Status Code: 200
   - Response يحتوي على `token`
   - احفظ الـ token من Response

#### 👤 الخطوة 2: الحصول على معلومات المستخدم

1. **اختر**: `Authentication > Get Current User`
2. **اضغط**: Send
3. **تحقق من**: معلومات المستخدم

#### 🔑 الخطوة 3: الحصول على الصلاحيات

1. **اختر**: `Authentication > Get User Permissions`
2. **اضغط**: Send
3. **تحقق من**: صلاحيات المستخدم

#### 📊 الخطوة 4: إنشاء بيانات أساسية

1. **إنشاء Main Event**:
   - اختر: `Main Events > Create Main Event`
   - اضغط: Send
   - احفظ الـ ID من Response

2. **إنشاء Sub Event**:
   - اختر: `Sub Events > Create Sub Event`
   - غيّر `main_event` في البيانات للـ ID الذي حصلت عليه
   - اضغط: Send

3. **إنشاء Nationality**:
   - اختر: `Nationalities > Create Nationality`
   - اضغط: Send
   - احفظ الـ ID

#### 🏛️ الخطوة 5: إنشاء وفد

1. **اختر**: `Delegations > Create Delegation`
2. **غيّر البيانات**:
   - `sub_event`: ID الـ Sub Event
   - `nationality`: ID الـ Nationality
3. **اضغط**: Send
4. **احفظ**: delegation ID

#### 👥 الخطوة 6: إضافة عضو

1. **اختر**: `Members > Create Member`
2. **غيّر**: `delegation` للـ delegation ID
3. **اضغط**: Send

#### 📈 الخطوة 7: فحص الإحصائيات

1. **اختر**: `Dashboard > Get Dashboard Stats`
2. **اضغط**: Send
3. **تحقق من**: الإحصائيات

## ✅ نتائج متوقعة

### تسجيل الدخول الناجح:
```json
{
  "token": "abc123...",
  "user": {
    "id": 1,
    "username": "admin",
    "full_name": "مدير النظام",
    "role": "SUPER_ADMIN"
  }
}
```

### إنشاء وفد ناجح:
```json
{
  "id": 1,
  "sub_event": 1,
  "nationality": 1,
  "type": "MILITARY",
  "status": "NOT_DEPARTED",
  "arrival_info": {
    "arrival_head": "اللواء أحمد محمد"
  }
}
```

## 🐛 حل المشاكل

### مشكلة: 401 Unauthorized
**الحل**: تأكد من تسجيل الدخول أولاً وحفظ الـ token

### مشكلة: 403 Forbidden
**الحل**: تأكد من إرسال Authorization header مع الـ token

### مشكلة: 404 Not Found
**الحل**: تأكد من تشغيل الخادم على المنفذ 8000

### مشكلة: 500 Internal Server Error
**الحل**: تحقق من console الخادم للأخطاء

## 📝 ملاحظات مهمة

1. **ترتيب الاختبار مهم**: يجب إنشاء Main Event قبل Sub Event
2. **حفظ الـ IDs**: احفظ IDs العناصر المضافة لاستخدامها لاحقاً
3. **الـ Token**: الـ token صالح لمدة محددة، أعد تسجيل الدخول إذا انتهت صلاحيته
4. **البيانات العربية**: تأكد من دعم UTF-8 في Postman

## 🎯 اختبارات إضافية

بعد الانتهاء من الاختبارات الأساسية، جرب:

1. **تحديث البيانات**: PUT requests
2. **حذف البيانات**: DELETE requests
3. **البحث والتصفية**: GET requests مع query parameters
4. **اختبار الصلاحيات**: جرب مع مستخدمين مختلفين

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. تحقق من console الخادم
2. تأكد من صحة البيانات المرسلة
3. تحقق من حالة قاعدة البيانات



