@echo off
echo ========================================
echo    تشغيل خادم Django Backend
echo ========================================
echo.

REM التحقق من وجود Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo خطأ: Python غير مثبت أو غير موجود في PATH
    pause
    exit /b 1
)

REM الانتقال إلى مجلد Backend
cd /d "%~dp0"

REM التحقق من وجود البيئة الافتراضية
if not exist "venv" (
    echo إنشاء البيئة الافتراضية...
    python -m venv venv
)

REM تفعيل البيئة الافتراضية
echo تفعيل البيئة الافتراضية...
call venv\Scripts\activate.bat

REM تثبيت المتطلبات
echo تثبيت المتطلبات...
pip install -r requirements.txt

REM اختبار الاتصال
echo اختبار الاتصال...
python test_connection.py

REM تحليل الجداول المكررة
echo تحليل الجداول المكررة...
python analyze_duplicate_tables.py

REM إنشاء مجلد templates إذا لم يكن موجوداً
if not exist "templates" (
    echo إنشاء مجلد templates...
    mkdir templates
    mkdir templates\admin
)

REM إنشاء ملف .env إذا لم يكن موجوداً
if not exist ".env" (
    echo إنشاء ملف .env...
    echo # Django Settings > .env
    echo SECRET_KEY=django-insecure-5gzz2rq(dx!(!d6_91v!!ddfj1e6vk^zf6y)atq%%h56i7=kr_w >> .env
    echo DEBUG=True >> .env
    echo ALLOWED_HOSTS=localhost,127.0.0.1 >> .env
    echo. >> .env
    echo # Database Settings >> .env
    echo DB_NAME=delegation_system >> .env
    echo DB_USER=postgres >> .env
    echo DB_PASSWORD=722003 >> .env
    echo DB_HOST=localhost >> .env
    echo DB_PORT=5432 >> .env
    echo. >> .env
    echo # Redis Settings >> .env
    echo REDIS_HOST=127.0.0.1 >> .env
    echo REDIS_PORT=6379 >> .env
    echo REDIS_DB=1 >> .env
    echo. >> .env
    echo # CORS Settings >> .env
    echo CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173 >> .env
    echo. >> .env
    echo # Security Settings >> .env
    echo CSRF_TRUSTED_ORIGINS=http://127.0.0.1:8000,http://localhost:8000,http://localhost:3000,http://localhost:5173 >> .env
)

REM تشغيل migrations
echo تشغيل migrations...
python manage.py makemigrations
python manage.py migrate

REM حذف البيانات وإنشاء مستخدم افتراضي
echo حذف البيانات وإنشاء مستخدم افتراضي...
python clear_database.py

REM إصلاح مشاكل المصادقة
echo إصلاح مشاكل المصادقة...
python fix_user_auth.py

REM تشغيل الخادم
echo.
echo ========================================
echo    تشغيل خادم Django على المنفذ 8000
echo ========================================
echo.
echo يمكنك الوصول للخادم عبر: http://localhost:8000
echo يمكنك الوصول للـ Admin عبر: http://localhost:8000/admin
echo يمكنك الوصول للـ API عبر: http://localhost:8000/api
echo.
echo اضغط Ctrl+C لإيقاف الخادم
echo.

python manage.py runserver 127.0.0.1:8000

pause
