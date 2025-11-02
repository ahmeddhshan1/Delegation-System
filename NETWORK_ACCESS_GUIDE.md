# 🌐 دليل الوصول من الشبكة - Network Access Guide

## 📌 المشكلة

عند محاولة الوصول للنظام من جهاز آخر على نفس الشبكة باستخدام IP مثل `1.16.34.85`، قد لا يعمل Login بشكل صحيح.

---

## ✅ الحل الكامل

### 1️⃣ إعدادات Backend

#### أ. تعديل ملف `.env` في Backend:

افتح: `Delegation-Backend\.env`

```env
# Django Settings
SECRET_KEY=django-insecure-5gzz2rq(dx!(!d6_91v!!ddfj1e6vk^zf6y)atq%%h56i7=kr_w
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,1.16.34.85,*

# Database Settings
DB_NAME=delegation_system
DB_USER=postgres
DB_PASSWORD=722003
DB_HOST=localhost
DB_PORT=5432

# CORS Settings - مهم جداً!
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://1.16.34.85:5173

# Security Settings
CSRF_TRUSTED_ORIGINS=http://127.0.0.1:8000,http://localhost:8000,http://localhost:3000,http://localhost:5173,http://1.16.34.85:8000,http://1.16.34.85:5173
```

**ملاحظة مهمة:**
- أضف IP الشبكة في `ALLOWED_HOSTS`
- أضف Frontend URL في `CORS_ALLOWED_ORIGINS`
- أضف جميع الـ URLs في `CSRF_TRUSTED_ORIGINS`

#### ب. تشغيل Backend على جميع الـ Interfaces:

بدلاً من:
```bash
python manage.py runserver
```

استخدم:
```bash
python manage.py runserver 0.0.0.0:8000
```

هذا يسمح للـ Backend بالاستماع على جميع الـ network interfaces.

---

### 2️⃣ إعدادات Frontend

#### تعديل ملف `.env` في Frontend:

افتح: `Delegation-Front\.env`

```env
# Environment Configuration
# Auto-detected local IP: 1.16.34.85
VITE_LOCAL_IP=1.16.34.85

# WebSocket Configuration
VITE_WS_URL=ws://1.16.34.85:8000/ws/updates/

# API Configuration
VITE_API_URL=http://1.16.34.85:8000/api
```

**ملاحظة:** استبدل `1.16.34.85` بـ IP جهازك الفعلي.

---

### 3️⃣ إعدادات Firewall (Windows)

يجب السماح للـ Ports في Windows Firewall:

#### أ. Port 8000 (Backend):
```powershell
# افتح PowerShell كـ Administrator وشغل:
New-NetFirewallRule -DisplayName "Django Backend" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

#### ب. Port 5173 (Frontend):
```powershell
New-NetFirewallRule -DisplayName "Vite Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

**أو يدوياً:**
1. افتح `Windows Defender Firewall`
2. اضغط `Advanced Settings`
3. `Inbound Rules` → `New Rule`
4. اختر `Port` → Next
5. اختر `TCP` وأدخل Port `8000` و `5173`
6. اختر `Allow the connection`
7. اسم القاعدة: `Django & Vite Servers`

---

### 4️⃣ تحديث ملف `run_all.bat`

أنشئ نسخة معدلة من `run_all.bat` للشبكة:

**ملف جديد:** `run_all_network.bat`

```batch
@echo off
chcp 65001 >nul
cls
echo ================================================================
echo    Delegation Management System - Run All (Network Mode)
echo ================================================================
echo.

echo [1/4] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python not found
    pause
    exit /b 1
)
echo OK: Python found
echo.

echo [2/4] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found
    pause
    exit /b 1
)
echo OK: Node.js found
echo.

if not exist "Delegation-Backend" (
    echo ERROR: Delegation-Backend folder not found
    pause
    exit /b 1
)

if not exist "Delegation-Front" (
    echo ERROR: Delegation-Front folder not found
    pause
    exit /b 1
)

if not exist "Delegation-Backend\venv" (
    echo ERROR: Virtual environment not found
    echo Please run install_all.bat first
    pause
    exit /b 1
)

echo [3/4] Checking Django installation...
cd Delegation-Backend
call venv\Scripts\activate.bat
python -c "import django" >nul 2>&1
if %errorlevel% neq 0 (
    echo Django not found. Installing requirements...
    pip install -r requirements.txt --quiet
    echo OK: Requirements installed
) else (
    echo OK: Django is installed
)
cd ..
echo.

echo ================================================================
echo    Starting System (Network Mode)...
echo ================================================================
echo.

set "ROOT_DIR=%cd%"

echo [4/5] Starting Backend Django server on 0.0.0.0:8000...
start "Backend Server - Django" cmd /k "cd /d "%ROOT_DIR%\Delegation-Backend" && call venv\Scripts\activate.bat && echo Backend running on http://0.0.0.0:8000 && echo Accessible from network at http://YOUR_IP:8000 && echo. && python manage.py runserver 0.0.0.0:8000"

timeout /t 3 /nobreak >nul

echo [5/5] Starting Frontend React server...
start "Frontend Server - React" cmd /k "cd /d "%ROOT_DIR%\Delegation-Front" && echo Frontend running on http://localhost:5173 && echo Accessible from network at http://YOUR_IP:5173 && echo. && npm run dev -- --host"

echo.
echo ================================================================
echo    System Started Successfully (Network Mode)!
echo ================================================================
echo.
echo Access URLs:
echo    Local Access:
echo    - Backend API:   http://localhost:8000/api/
echo    - Django Admin:  http://localhost:8000/admin/
echo    - Frontend:      http://localhost:5173/
echo.
echo    Network Access (replace YOUR_IP with actual IP):
echo    - Backend API:   http://YOUR_IP:8000/api/
echo    - Django Admin:  http://YOUR_IP:8000/admin/
echo    - Frontend:      http://YOUR_IP:5173/
echo.
echo Notes:
echo    - Backend is listening on ALL network interfaces (0.0.0.0)
echo    - Frontend is accessible from network
echo    - Make sure Firewall allows ports 8000 and 5173
echo    - Update .env files with your actual IP address
echo.
echo ================================================================

timeout /t 5
exit
```

---

## 🔍 كيفية معرفة IP جهازك

### Windows:
```cmd
ipconfig
```
ابحث عن `IPv4 Address` في الشبكة النشطة (مثل: `192.168.1.100` أو `1.16.34.85`)

### أو استخدم:
```cmd
ipconfig | findstr /i "IPv4"
```

---

## 📋 خطوات التشغيل على الشبكة

### على جهاز السيرفر (الذي يشغل Backend):

1. **احصل على IP الجهاز:**
   ```cmd
   ipconfig
   ```
   مثال: `1.16.34.85`

2. **عدّل Backend `.env`:**
   - أضف IP في `ALLOWED_HOSTS`
   - أضف IP في `CORS_ALLOWED_ORIGINS`
   - أضف IP في `CSRF_TRUSTED_ORIGINS`

3. **عدّل Frontend `.env`:**
   ```env
   VITE_API_URL=http://1.16.34.85:8000/api
   VITE_WS_URL=ws://1.16.34.85:8000/ws/updates/
   ```

4. **شغّل النظام:**
   ```cmd
   run_all_network.bat
   ```
   أو يدوياً:
   ```cmd
   # Backend
   cd Delegation-Backend
   venv\Scripts\activate.bat
   python manage.py runserver 0.0.0.0:8000

   # Frontend (في نافذة أخرى)
   cd Delegation-Front
   npm run dev -- --host
   ```

5. **افتح Firewall:**
   - Port 8000
   - Port 5173

### على أجهزة أخرى في الشبكة:

افتح المتصفح على:
```
http://1.16.34.85:5173
```

---

## ⚠️ ملاحظات الأمان

### للتطوير المحلي:
✅ استخدم `0.0.0.0` و `*` في ALLOWED_HOSTS

### للإنتاج:
❌ **لا تستخدم** `*` في ALLOWED_HOSTS
✅ حدد IP والدومينات بالضبط:
```env
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com,192.168.1.100
```

---

## 🧪 اختبار الاتصال

### 1. اختبار Backend:
من جهاز آخر على الشبكة:
```
http://1.16.34.85:8000/api/
```
يجب أن يظهر Django REST Framework page.

### 2. اختبار WebSocket:
افتح Console في المتصفح:
```javascript
const ws = new WebSocket('ws://1.16.34.85:8000/ws/updates/');
ws.onopen = () => console.log('Connected!');
ws.onerror = (e) => console.error('Error:', e);
```

### 3. اختبار Login:
جرب تسجيل الدخول من Frontend على الشبكة.

---

## 🔧 حل المشاكل

### مشكلة: Cannot connect to Backend

**الأسباب المحتملة:**
1. Firewall يحجب Port 8000
2. Backend لا يعمل على `0.0.0.0`
3. IP خاطئ في `.env`

**الحل:**
```cmd
# 1. تحقق من Backend يعمل
netstat -an | findstr :8000

# 2. تأكد من Firewall
# Windows Defender Firewall → Allow an app

# 3. تحقق من IP صحيح
ipconfig
```

### مشكلة: CORS Error

**السبب:** Frontend URL غير موجود في Backend CORS settings

**الحل:**
عدّل `Delegation-Backend\.env`:
```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://1.16.34.85:5173
```
ثم أعد تشغيل Backend.

### مشكلة: CSRF Token Error

**السبب:** Frontend URL غير موجود في CSRF trusted origins

**الحل:**
عدّل `Delegation-Backend\.env`:
```env
CSRF_TRUSTED_ORIGINS=http://localhost:8000,http://1.16.34.85:8000,http://1.16.34.85:5173
```

### مشكلة: WebSocket Failed

**السبب:** WebSocket URL خاطئ أو Backend لا يدعم WebSocket

**الحل:**
1. تحقق من `VITE_WS_URL` في Frontend `.env`
2. تأكد من تشغيل Daphne (مدمج في Django Channels)
3. تحقق من `ASGI` settings في Backend

---

## 📝 Checklist للوصول من الشبكة

قبل التشغيل، تحقق من:

- [ ] Backend `.env` يحتوي على IP في `ALLOWED_HOSTS`
- [ ] Backend `.env` يحتوي على Frontend URL في `CORS_ALLOWED_ORIGINS`
- [ ] Backend `.env` يحتوي على URLs في `CSRF_TRUSTED_ORIGINS`
- [ ] Frontend `.env` يحتوي على IP الصحيح
- [ ] Backend يعمل على `0.0.0.0:8000`
- [ ] Frontend يعمل مع `--host` flag
- [ ] Firewall يسمح بـ Port 8000 و 5173
- [ ] IP جهاز السيرفر صحيح ومستقر

---

## 🎯 ملخص سريع

```bash
# 1. احصل على IP
ipconfig

# 2. عدّل Backend .env
ALLOWED_HOSTS=localhost,127.0.0.1,YOUR_IP,*
CORS_ALLOWED_ORIGINS=http://YOUR_IP:5173
CSRF_TRUSTED_ORIGINS=http://YOUR_IP:8000,http://YOUR_IP:5173

# 3. عدّل Frontend .env
VITE_API_URL=http://YOUR_IP:8000/api
VITE_WS_URL=ws://YOUR_IP:8000/ws/updates/

# 4. افتح Firewall
# Ports: 8000, 5173

# 5. شغّل Backend
python manage.py runserver 0.0.0.0:8000

# 6. شغّل Frontend
npm run dev -- --host

# 7. افتح من أي جهاز
http://YOUR_IP:5173
```

---

**تم إنشاء هذا الدليل لحل مشاكل الوصول من الشبكة! 🌐**
