# 🏛️ دليل تثبيت نظام إدارة الوفود

## 📋 المتطلبات الأساسية

قبل البدء، يجب تثبيت:

1. **Python 3.8+** - [تحميل من هنا](https://www.python.org/downloads/)
2. **Node.js 18+** - [تحميل من هنا](https://nodejs.org/)
3. **PostgreSQL** - [تحميل من هنا](https://www.postgresql.org/download/)
4. **Git** (اختياري) - [تحميل من هنا](https://git-scm.com/downloads)

---

## 🚀 التثبيت السريع (أوتوماتيكي)

### استخدام ملف التثبيت الشامل

1. **قم بتشغيل ملف `install_all.bat`:**
   ```bash
   install_all.bat
   ```

2. **سيقوم الملف تلقائياً بـ:**
   - ✅ التحقق من تثبيت Python و Node.js
   - ✅ إنشاء البيئة الافتراضية Python
   - ✅ تثبيت جميع حزم Python من `requirements.txt`
   - ✅ تثبيت جميع حزم Node.js من `package.json`
   - ✅ إنشاء ملف `.env`
   - ✅ تشغيل migrations لقاعدة البيانات
   - ✅ جمع الملفات الثابتة

---

## 📦 التثبيت اليدوي (خطوة بخطوة)

### 1️⃣ تثبيت Backend (Python)

#### الخطوة 1: الانتقال إلى مجلد Backend
```bash
cd Delegation-Backend
```

#### الخطوة 2: إنشاء البيئة الافتراضية
```bash
python -m venv venv
```

#### الخطوة 3: تفعيل البيئة الافتراضية

**Windows:**
```bash
venv\Scripts\activate.bat
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

#### الخطوة 4: تثبيت المتطلبات
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

أو استخدام الملف الشامل:
```bash
pip install -r ../requirements.txt
```

#### الخطوة 5: إنشاء ملف `.env`
انسخ ملف `env.example` إلى `.env` وعدّل البيانات حسب الحاجة:
```bash
copy env.example .env
```

أو أنشئ ملف `.env` جديد:
```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Settings
DB_NAME=delegation_system
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### الخطوة 6: تشغيل Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

#### الخطوة 7: إنشاء مستخدم Admin
```bash
python manage.py createsuperuser
```

أو استخدام السكريبت المخصص:
```bash
python add_admin_user.py
```

#### الخطوة 8: جمع الملفات الثابتة
```bash
python manage.py collectstatic
```

#### الخطوة 9: تشغيل الخادم
```bash
python manage.py runserver
```

الخادم سيعمل على: `http://localhost:8000`

---

### 2️⃣ تثبيت Frontend (Node.js)

#### الخطوة 1: الانتقال إلى مجلد Frontend
```bash
cd Delegation-Front
```

#### الخطوة 2: تثبيت الحزم
```bash
npm install
```

#### الخطوة 3: إنشاء ملف `.env` (اختياري)
أنشئ ملف `.env` في مجلد Frontend:
```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws/updates/
```

#### الخطوة 4: تشغيل خادم التطوير
```bash
npm run dev
```

الواجهة الأمامية ستعمل على: `http://localhost:5173`

---

## 📝 ملفات المتطلبات

### `requirements.txt`
يحتوي على جميع حزم Python المطلوبة:
- Django 5.2.7
- Django REST Framework 3.15.2
- PostgreSQL Driver (psycopg2-binary)
- Channels (WebSocket)
- CORS Headers
- وغيرها...

### `Delegation-Front/package.json`
يحتوي على جميع حزم Node.js المطلوبة:
- React 19
- Redux Toolkit
- Vite 7
- Tailwind CSS 4
- وغيرها...

---

## 🗄️ إعداد قاعدة البيانات PostgreSQL

### 1. تثبيت PostgreSQL

### 2. إنشاء قاعدة البيانات
```sql
CREATE DATABASE delegation_system;
CREATE USER postgres WITH PASSWORD 'your-password';
ALTER ROLE postgres SET client_encoding TO 'utf8';
ALTER ROLE postgres SET default_transaction_isolation TO 'read committed';
ALTER ROLE postgres SET timezone TO 'Africa/Cairo';
GRANT ALL PRIVILEGES ON DATABASE delegation_system TO postgres;
```

### 3. تطبيق Schema (اختياري)
إذا كان لديك ملف `database_schema.sql`:
```bash
psql -U postgres -d delegation_system -f database_schema.sql
```

---

## ✅ التحقق من التثبيت

### Backend:
```bash
cd Delegation-Backend
call venv\Scripts\activate.bat  # Windows
python manage.py check
python manage.py runserver
```

افتح المتصفح على: `http://localhost:8000/api/`

### Frontend:
```bash
cd Delegation-Front
npm run dev
```

افتح المتصفح على: `http://localhost:5173`

---

## 🔧 استكشاف الأخطاء

### مشكلة: Python غير موجود
**الحل:** قم بتثبيت Python 3.8+ وأضفه إلى PATH

### مشكلة: Node.js غير موجود
**الحل:** قم بتثبيت Node.js 18+ وأضفه إلى PATH

### مشكلة: خطأ في الاتصال بقاعدة البيانات
**الحل:** 
1. تأكد من أن PostgreSQL يعمل
2. تحقق من بيانات الاتصال في ملف `.env`
3. تأكد من وجود قاعدة البيانات `delegation_system`

### مشكلة: خطأ في تثبيت الحزم
**الحل:**
```bash
# Python
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall

# Node.js
npm cache clean --force
npm install
```

---

## 📚 الملفات المهمة

- `requirements.txt` - جميع حزم Python المطلوبة
- `install_all.bat` - ملف تثبيت أوتوماتيكي شامل
- `Delegation-Backend/requirements.txt` - حزم Backend الأصلية
- `Delegation-Front/package.json` - حزم Frontend
- `.env` - ملف الإعدادات (يجب إنشاؤه)

---

## 🚀 التشغيل السريع

بعد التثبيت، لتشغيل النظام:

### Terminal 1 - Backend:
```bash
cd Delegation-Backend
call venv\Scripts\activate.bat
python manage.py runserver
```

### Terminal 2 - Frontend:
```bash
cd Delegation-Front
npm run dev
```

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. تأكد من تثبيت جميع المتطلبات الأساسية
2. راجع ملف `.env` وتأكد من صحة البيانات
3. تأكد من أن PostgreSQL يعمل
4. راجع ملفات السجل (logs) للبحث عن الأخطاء

---

## ✅ قائمة التحقق

- [ ] Python 3.8+ مثبت
- [ ] Node.js 18+ مثبت
- [ ] PostgreSQL مثبت ويعمل
- [ ] قاعدة البيانات `delegation_system` موجودة
- [ ] تم تشغيل `install_all.bat` بنجاح
- [ ] ملف `.env` موجود وصحيح
- [ ] تم تشغيل migrations بنجاح
- [ ] Backend يعمل على `http://localhost:8000`
- [ ] Frontend يعمل على `http://localhost:5173`

---

**تم إنشاء هذا الدليل بواسطة نظام إدارة الوفود**

