@echo off
chcp 65001 >nul
echo ================================================================
echo    🏛️  نظام إدارة الوفود - تثبيت جميع المتطلبات
echo    Delegation Management System - Install All Requirements
echo ================================================================
echo.

REM التحقق من وجود Python
echo [1/8] التحقق من تثبيت Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ خطأ: Python غير مثبت أو غير موجود في PATH
    echo يرجى تثبيت Python 3.8 أو أحدث من https://www.python.org/downloads/
    pause
    exit /b 1
)
python --version
echo ✅ Python مثبت بنجاح
echo.

REM التحقق من وجود Node.js
echo [2/8] التحقق من تثبيت Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ خطأ: Node.js غير مثبت أو غير موجود في PATH
    echo يرجى تثبيت Node.js 18 أو أحدث من https://nodejs.org/
    pause
    exit /b 1
)
node --version
npm --version
echo ✅ Node.js مثبت بنجاح
echo.

REM ================================================================
REM Backend Setup - إعداد الخلفية
REM ================================================================
echo [3/8] إعداد Backend (Python)...
cd /d "%~dp0"

REM الانتقال إلى مجلد Backend
if exist "Delegation-Backend" (
    cd Delegation-Backend
) else (
    echo ❌ خطأ: مجلد Delegation-Backend غير موجود
    pause
    exit /b 1
)

REM إنشاء البيئة الافتراضية إذا لم تكن موجودة
if not exist "venv" (
    echo إنشاء البيئة الافتراضية Python...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo ❌ خطأ في إنشاء البيئة الافتراضية
        pause
        exit /b 1
    )
    echo ✅ تم إنشاء البيئة الافتراضية بنجاح
) else (
    echo ✅ البيئة الافتراضية موجودة مسبقاً
)

REM تفعيل البيئة الافتراضية
echo تفعيل البيئة الافتراضية...
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo ❌ خطأ في تفعيل البيئة الافتراضية
    pause
    exit /b 1
)

REM ترقية pip
echo ترقية pip إلى أحدث إصدار...
python -m pip install --upgrade pip --quiet
echo.

REM تثبيت متطلبات Python
echo تثبيت حزم Python...
if exist "requirements.txt" (
    pip install -r requirements.txt
) else (
    REM إذا لم يكن ملف requirements.txt في مجلد Backend، جرب الملفات في الجذر
    cd ..
    if exist "requirements_all.txt" (
        pip install -r requirements_all.txt
        cd Delegation-Backend
    ) else if exist "requirements.txt" (
        pip install -r requirements.txt
        cd Delegation-Backend
    ) else (
        echo ❌ خطأ: ملف requirements.txt أو requirements_all.txt غير موجود
        pause
        exit /b 1
    )
)

if %errorlevel% neq 0 (
    echo ❌ خطأ في تثبيت حزم Python
    pause
    exit /b 1
)
echo ✅ تم تثبيت حزم Python بنجاح
echo.

REM ================================================================
REM Frontend Setup - إعداد الواجهة الأمامية
REM ================================================================
echo [4/8] إعداد Frontend (Node.js)...
cd ..

REM الانتقال إلى مجلد Frontend
if exist "Delegation-Front" (
    cd Delegation-Front
) else (
    echo ❌ خطأ: مجلد Delegation-Front غير موجود
    pause
    exit /b 1
)

REM تثبيت حزم Node.js
echo تثبيت حزم Node.js...
if exist "package.json" (
    echo يرجى الانتظار... قد يستغرق هذا بعض الوقت...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ خطأ في تثبيت حزم Node.js
        pause
        exit /b 1
    )
    echo ✅ تم تثبيت حزم Node.js بنجاح
) else (
    echo ⚠️  تحذير: ملف package.json غير موجود
)
echo.

REM ================================================================
REM Database Setup - إعداد قاعدة البيانات
REM ================================================================
echo [5/8] إعداد قاعدة البيانات...
cd ..

REM العودة إلى مجلد Backend
if exist "Delegation-Backend" (
    cd Delegation-Backend
) else (
    echo ❌ خطأ: مجلد Delegation-Backend غير موجود
    pause
    exit /b 1
)

REM تفعيل البيئة الافتراضية مرة أخرى
call venv\Scripts\activate.bat

REM إنشاء ملف .env إذا لم يكن موجوداً
if not exist ".env" (
    echo إنشاء ملف .env...
    (
        echo # Django Settings
        echo SECRET_KEY=django-insecure-5gzz2rq(dx!(!d6_91v!!ddfj1e6vk^zf6y)atq%%h56i7=kr_w
        echo DEBUG=True
        echo ALLOWED_HOSTS=localhost,127.0.0.1,*
        echo.
        echo # Database Settings
        echo DB_NAME=delegation_system
        echo DB_USER=postgres
        echo DB_PASSWORD=722003
        echo DB_HOST=localhost
        echo DB_PORT=5432
        echo.
        echo # Redis Settings (Optional)
        echo REDIS_HOST=127.0.0.1
        echo REDIS_PORT=6379
        echo REDIS_DB=1
        echo.
        echo # CORS Settings
        echo CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
        echo.
        echo # Security Settings
        echo CSRF_TRUSTED_ORIGINS=http://127.0.0.1:8000,http://localhost:8000,http://localhost:3000,http://localhost:5173
    ) > .env
    echo ✅ تم إنشاء ملف .env
) else (
    echo ✅ ملف .env موجود مسبقاً
)
echo.

REM تشغيل migrations
echo تشغيل migrations لقاعدة البيانات...
python manage.py makemigrations --quiet
python manage.py migrate --no-input
if %errorlevel% neq 0 (
    echo ⚠️  تحذير: قد تكون هناك مشاكل في الاتصال بقاعدة البيانات
    echo يرجى التأكد من أن PostgreSQL يعمل وأن بيانات الاتصال صحيحة في ملف .env
)
echo.

REM ================================================================
REM Create Admin User - إنشاء مستخدم Admin
REM ================================================================
echo [6/8] إنشاء مستخدم Admin...
if exist "add_admin_user.py" (
    python add_admin_user.py
    echo.
) else (
    echo ⚠️  تحذير: ملف add_admin_user.py غير موجود
    echo يمكنك إنشاء مستخدم Admin يدوياً باستخدام: python manage.py createsuperuser
)
echo.

REM ================================================================
REM Collect Static Files - جمع الملفات الثابتة
REM ================================================================
echo [7/8] جمع الملفات الثابتة...
python manage.py collectstatic --no-input --quiet
echo ✅ تم جمع الملفات الثابتة بنجاح
echo.

REM ================================================================
REM Final Summary - الملخص النهائي
REM ================================================================
echo [8/8] ✅ تم الانتهاء من التثبيت بنجاح!
echo.
echo ================================================================
echo    📋 ملخص التثبيت
echo ================================================================
echo.
echo ✅ Backend (Python):
echo    - البيئة الافتراضية: venv\
echo    - جميع الحزم مثبتة
echo    - قاعدة البيانات: مهيأة
echo.
echo ✅ Frontend (Node.js):
echo    - جميع الحزم مثبتة في node_modules\
echo.
echo ================================================================
echo    🚀 خطوات التشغيل
echo ================================================================
echo.
echo 1️⃣  لتشغيل Backend:
echo    cd Delegation-Backend
echo    call venv\Scripts\activate.bat
echo    python manage.py runserver
echo.
echo 2️⃣  لتشغيل Frontend:
echo    cd Delegation-Front
echo    npm run dev
echo.
echo ================================================================
echo    🌐 روابط الوصول
echo ================================================================
echo.
echo Backend API:    http://localhost:8000/api/
echo Django Admin:  http://localhost:8000/admin/
echo Frontend:      http://localhost:5173/
echo.
echo ================================================================
echo.

pause

