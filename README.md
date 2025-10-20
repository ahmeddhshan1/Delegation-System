# 🏛️ نظام إدارة الوفود - Delegation Management System

نظام شامل لإدارة الوفود الرسمية والأحداث العسكرية والمدنية.

## 📋 المحتويات

- [المتطلبات](#المتطلبات)
- [التثبيت والتشغيل](#التثبيت-والتشغيل)
- [البنية العامة](#البنية-العامة)
- [الميزات](#الميزات)
- [الـ API](#الـ-api)
- [استكشاف الأخطاء](#استكشاف-الأخطاء)

## 🛠️ المتطلبات

### متطلبات النظام:
- **Python 3.8+**
- **Node.js 16+**
- **PostgreSQL 12+**

### متطلبات Python:
```
Django==5.2.7
djangorestframework==3.15.2
psycopg2-binary==2.9.9
django-environ==0.11.2
python-decouple==3.8
django-extensions==3.2.3
Pillow==10.3.0
whitenoise==6.6.0
gunicorn==21.2.0
```

### متطلبات Node.js:
```
React 19+
Vite 7+
Tailwind CSS 4+
Axios
React Router
React Hook Form
```

## 🚀 التثبيت والتشغيل

### الطريقة الأولى: التشغيل التلقائي (الأسهل)

#### 1. تشغيل Backend:
```bash
# انتقل إلى مجلد Backend
cd Delegation-Backend

# تشغيل الخادم
python manage.py runserver
```

#### 2. تشغيل Frontend:
```bash
# انتقل إلى مجلد Frontend
cd Delegation-Front

# تشغيل الخادم
npm run dev
```

### الطريقة الثانية: التشغيل اليدوي

#### تشغيل Backend:

1. **إعداد قاعدة البيانات:**
```bash
# إنشاء قاعدة بيانات PostgreSQL
createdb delegation_system
```

2. **إعداد Backend:**
```bash
cd Delegation-Backend

# إنشاء بيئة افتراضية
python -m venv venv

# تفعيل البيئة الافتراضية
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# تثبيت المتطلبات
pip install -r requirements.txt

# تشغيل migrations
python manage.py makemigrations
python manage.py migrate

# إنشاء superuser
python manage.py createsuperuser

# تشغيل الخادم
python manage.py runserver 127.0.0.1:8000
```

#### تشغيل Frontend:

```bash
cd Delegation-Front

# تثبيت المتطلبات
npm install

# تشغيل الخادم
npm run dev
```

## 📁 البنية العامة

```
Delegation-System/
├── Delegation-Backend/          # Django Backend
│   ├── delegation_system/       # إعدادات Django
│   ├── api/                     # API endpoints
│   ├── accounts/                # نظام المستخدمين
│   ├── venv/                    # البيئة الافتراضية
│   └── requirements.txt         # متطلبات Python
│
├── Delegation-Front/            # React Frontend
│   ├── src/
│   │   ├── components/          # مكونات React
│   │   ├── pages/               # صفحات التطبيق
│   │   ├── services/            # خدمات API
│   │   └── hooks/               # React Hooks
│   └── package.json             # متطلبات Node.js
│
└── delegation_system_schema.sql # قاعدة البيانات
```

## ✨ الميزات

### 🎯 الميزات الأساسية:
- **إدارة الأحداث الرئيسية والفرعية**
- **إدارة الوفود (عسكرية/مدنية)**
- **إدارة الأعضاء والمناصب**
- **نظام المصادقة والصلاحيات**
- **لوحة تحكم شاملة**
- **تقارير وإحصائيات**

### 🔄 الميزات المتقدمة:
- **نظام Audit Log شامل**
- **إدارة جلسات المغادرة**
- **نظام إشعارات**
- **تصدير البيانات**

## 🌐 الوصول للتطبيق

### بعد التشغيل:
- **Frontend:** http://localhost:5173 (يعمل منفصل)
- **Backend API:** http://localhost:8000/api (يعمل منفصل)
- **Django Admin:** http://localhost:8000/admin

### ملاحظة مهمة:
النظام الآن منفصل - الفرونت إند والباك إند يعملان بشكل مستقل بدون اتصال مباشر.

### نظام التوجيه التلقائي:
- **المستخدمين العاديين:** يبقون في التطبيق الرئيسي
- **السوبر أدمن:** يتم توجيههم تلقائياً إلى Django Admin Dashboard

### بيانات تسجيل الدخول الافتراضية:
```
الخيار الأول:
Username: najibe
Password: 722003
Full Name: احمد نيجب

الخيار الثاني:
Username: admin
Password: admin123
Full Name: مدير النظام
```

## 🔌 الـ API

### Endpoints الرئيسية:

#### الأحداث:
- `GET /api/main-events/` - جلب الأحداث الرئيسية
- `POST /api/main-events/` - إنشاء حدث رئيسي
- `GET /api/sub-events/` - جلب الأحداث الفرعية

#### الوفود:
- `GET /api/delegations/` - جلب الوفود
- `POST /api/delegations/` - إنشاء وفد
- `GET /api/members/` - جلب الأعضاء

#### المصادقة:
- `POST /api/auth/login/` - تسجيل الدخول
- `POST /api/auth/logout/` - تسجيل الخروج
- `GET /api/auth/me/` - معلومات المستخدم الحالي

## 🔧 استكشاف الأخطاء

### مشاكل شائعة:

#### 1. خطأ في الاتصال بقاعدة البيانات:
```bash
# تحقق من تشغيل PostgreSQL
# تحقق من بيانات الاتصال في .env
```

#### 2. خطأ CORS:
```bash
# تأكد من إعدادات CORS في settings.py
# تأكد من صحة المنافذ
```

#### 3. خطأ في تثبيت المتطلبات:
```bash
# تحديث pip
pip install --upgrade pip

# تثبيت المتطلبات مرة أخرى
pip install -r requirements.txt
```

### ملفات السجلات:
- **Django Logs:** في terminal تشغيل Backend
- **React Logs:** في terminal تشغيل Frontend
- **Browser Console:** F12 في المتصفح

## 📞 الدعم الفني

### معلومات الاتصال:
- **المطور:** أحمد
- **البريد الإلكتروني:** [البريد الإلكتروني]
- **التاريخ:** 2024

### إصدارات البرنامج:
- **الإصدار الحالي:** 1.0.0
- **آخر تحديث:** ديسمبر 2024

---

## 📝 ملاحظات مهمة

1. **تأكد من تشغيل PostgreSQL قبل تشغيل Backend**
2. **استخدم المتصفحات الحديثة (Chrome, Firefox, Edge)**
3. **في حالة تغيير المنافذ، حدث ملفات .env**
4. **احتفظ بنسخة احتياطية من قاعدة البيانات**

## 🎉 تهانينا!

النظام جاهز للاستخدام! يمكنك الآن:
- إدارة الأحداث والوفود
- إضافة الأعضاء والمناصب
- مراقبة الإحصائيات
- استخدام نظام التقارير الشامل